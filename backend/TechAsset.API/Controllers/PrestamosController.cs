using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TechAsset.Application.DTOs.Prestamos;
using TechAsset.Domain.Entities;
using TechAsset.Infrastructure.Data;

namespace TechAsset.API.Controllers;

[ApiController, Route("api/prestamos"), Authorize]
public class PrestamosController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? estado)
    {
        var query = ConsultaCompleta();
        var currentId = UsuarioActual();
        if (User.IsInRole("Colaborador")) query = query.Where(x => x.UsuarioId == currentId);
        if (!string.IsNullOrWhiteSpace(estado)) query = query.Where(x => x.Estado.ToLower() == estado.Trim().ToLower());
        return Ok((await query.OrderByDescending(x => x.FechaPrestamo).ThenByDescending(x => x.Id).ToListAsync()).Select(Mapear));
    }

    [HttpGet("activos")]
    public async Task<IActionResult> Activos()
    {
        var query = ConsultaCompleta().Where(x => x.Estado == "Activo");
        if (User.IsInRole("Colaborador")) query = query.Where(x => x.UsuarioId == UsuarioActual());
        return Ok((await query.OrderBy(x => x.FechaDevolucionProgramada).ToListAsync()).Select(Mapear));
    }

    [HttpGet("historial")]
    public async Task<IActionResult> Historial()
    {
        var query = ConsultaCompleta();
        if (User.IsInRole("Colaborador")) query = query.Where(x => x.UsuarioId == UsuarioActual());
        return Ok((await query.OrderByDescending(x => x.FechaDevolucion ?? x.FechaPrestamo).ToListAsync()).Select(Mapear));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Obtener(Guid id)
    {
        var prestamo = await ConsultaCompleta().FirstOrDefaultAsync(x => x.Id == id);
        if (prestamo is null) return NotFound(new { mensaje = "Préstamo no encontrado." });
        if (User.IsInRole("Colaborador") && prestamo.UsuarioId != UsuarioActual()) return Forbid();
        return Ok(Mapear(prestamo));
    }

    [HttpPost, Authorize(Roles = "Colaborador")]
    public async Task<IActionResult> Crear(CrearPrestamoDto dto)
    {
        var hoy = DateOnly.FromDateTime(DateTime.Today);
        if (dto.FechaPrestamo < hoy) return BadRequest(new { mensaje = "La fecha del préstamo no puede estar en el pasado." });
        if (dto.FechaDevolucionProgramada <= dto.FechaPrestamo) return BadRequest(new { mensaje = "La fecha de devolución debe ser posterior a la fecha del préstamo." });
        var equipo = await db.Equipos.FirstOrDefaultAsync(x => x.Id == dto.EquipoId);
        if (equipo is null) return NotFound(new { mensaje = "Equipo no encontrado." });
        if (equipo.Estado == "Mantenimiento") return Conflict(new { mensaje = "No se puede solicitar un equipo en mantenimiento." });
        if (equipo.Estado == "Baja") return Conflict(new { mensaje = "No se puede solicitar un equipo dado de baja." });
        if (equipo.Estado == "Prestado" || await db.Prestamos.AnyAsync(x => x.EquipoId == equipo.Id && x.Estado == "Activo")) return Conflict(new { mensaje = "El equipo ya se encuentra asociado a un préstamo activo." });
        // RN-05: toda solicitud queda asignada desde su creación a un responsable activo.
        var responsableId = await db.Usuarios
            .Where(x => x.Activo && x.Rol == "Responsable de Tecnología")
            .OrderBy(x => x.NombreCompleto)
            .Select(x => (Guid?)x.Id)
            .FirstOrDefaultAsync();
        if (responsableId is null) return Conflict(new { mensaje = "No existe un Responsable de Tecnología activo para asignar la solicitud." });
        var prestamo = new Prestamo { FechaPrestamo = dto.FechaPrestamo, FechaDevolucionProgramada = dto.FechaDevolucionProgramada, Motivo = dto.Motivo.Trim(), UsuarioId = UsuarioActual(), EquipoId = equipo.Id, ResponsableId = responsableId, Estado = "Pendiente" };
        db.Prestamos.Add(prestamo);
        db.MovimientosEquipo.Add(Movimiento(equipo.Id, prestamo.Id, "Solicitud", "Solicitud de préstamo registrada y pendiente de evaluación."));
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Obtener), new { id = prestamo.Id }, Mapear(await ConsultaCompleta().FirstAsync(x => x.Id == prestamo.Id)));
    }

    [HttpPatch("{id:guid}/aprobar"), Authorize(Roles = "Responsable de Tecnología")]
    public async Task<IActionResult> Aprobar(Guid id)
    {
        var prestamo = await db.Prestamos.Include(x => x.Equipo).FirstOrDefaultAsync(x => x.Id == id);
        if (prestamo is null) return NotFound(new { mensaje = "Préstamo no encontrado." });
        if (prestamo.Estado != "Pendiente") return Conflict(new { mensaje = "Solo una solicitud pendiente puede aprobarse." });
        var equipo = prestamo.Equipo!;
        if (equipo.Estado is "Mantenimiento" or "Baja") return Conflict(new { mensaje = $"No se puede aprobar porque el equipo está en {equipo.Estado}." });
        if (equipo.Estado == "Prestado" || await db.Prestamos.AnyAsync(x => x.EquipoId == equipo.Id && x.Estado == "Activo" && x.Id != id)) return Conflict(new { mensaje = "El equipo ya tiene un préstamo activo." });
        // El cambio del préstamo y del inventario se persiste de forma atómica en SaveChanges.
        prestamo.Estado = "Activo";
        prestamo.ResponsableId = UsuarioActual();
        equipo.Estado = "Prestado";
        db.MovimientosEquipo.Add(Movimiento(equipo.Id, prestamo.Id, "Préstamo aprobado", "Equipo asignado al colaborador y marcado como Prestado."));
        await db.SaveChangesAsync();
        return Ok(Mapear(await ConsultaCompleta().FirstAsync(x => x.Id == id)));
    }

    [HttpPatch("{id:guid}/rechazar"), Authorize(Roles = "Responsable de Tecnología")]
    public async Task<IActionResult> Rechazar(Guid id, RechazarPrestamoDto dto)
    {
        var prestamo = await db.Prestamos.FirstOrDefaultAsync(x => x.Id == id);
        if (prestamo is null) return NotFound(new { mensaje = "Préstamo no encontrado." });
        if (prestamo.Estado != "Pendiente") return Conflict(new { mensaje = "Solo una solicitud pendiente puede rechazarse." });
        prestamo.Estado = "Rechazado";
        prestamo.Observacion = dto.Observacion.Trim();
        prestamo.ResponsableId = UsuarioActual();
        db.MovimientosEquipo.Add(Movimiento(prestamo.EquipoId, prestamo.Id, "Solicitud rechazada", prestamo.Observacion));
        await db.SaveChangesAsync();
        return Ok(Mapear(await ConsultaCompleta().FirstAsync(x => x.Id == id)));
    }

    [HttpPatch("{id:guid}/cancelar"), Authorize(Roles = "Colaborador")]
    public async Task<IActionResult> Cancelar(Guid id)
    {
        var prestamo = await db.Prestamos.FirstOrDefaultAsync(x => x.Id == id);
        if (prestamo is null) return NotFound(new { mensaje = "Préstamo no encontrado." });
        if (prestamo.UsuarioId != UsuarioActual()) return Forbid();
        if (prestamo.Estado != "Pendiente") return Conflict(new { mensaje = "Solo una solicitud pendiente puede cancelarse." });
        prestamo.Estado = "Cancelado";
        db.MovimientosEquipo.Add(Movimiento(prestamo.EquipoId, prestamo.Id, "Solicitud cancelada", "El colaborador canceló la solicitud antes de su aprobación."));
        await db.SaveChangesAsync();
        return Ok(Mapear(await ConsultaCompleta().FirstAsync(x => x.Id == id)));
    }

    [HttpPost("{id:guid}/devolucion"), Authorize(Roles = "Responsable de Tecnología")]
    public async Task<IActionResult> RegistrarDevolucion(Guid id, RegistrarDevolucionDto dto)
    {
        var prestamo = await db.Prestamos.Include(x => x.Equipo).FirstOrDefaultAsync(x => x.Id == id);
        if (prestamo is null) return NotFound(new { mensaje = "Préstamo no encontrado." });
        if (prestamo.Estado != "Activo") return Conflict(new { mensaje = "Solo un préstamo activo puede registrar devolución." });
        if (dto.FechaDevolucion <= prestamo.FechaPrestamo) return BadRequest(new { mensaje = "La fecha de devolución debe ser posterior a la fecha del préstamo." });
        if (dto.FechaDevolucion > DateOnly.FromDateTime(DateTime.Today)) return BadRequest(new { mensaje = "La devolución no puede registrarse con una fecha futura." });
        prestamo.FechaDevolucion = dto.FechaDevolucion;
        prestamo.Observacion = dto.Observacion.Trim();
        prestamo.Estado = "Devuelto";
        prestamo.ResponsableId = UsuarioActual();
        prestamo.Equipo!.Estado = "Disponible";
        db.MovimientosEquipo.Add(Movimiento(prestamo.EquipoId, prestamo.Id, "Devolución", $"Devolución registrada. {prestamo.Observacion}"));
        await db.SaveChangesAsync();
        return Ok(Mapear(await ConsultaCompleta().FirstAsync(x => x.Id == id)));
    }

    private IQueryable<Prestamo> ConsultaCompleta() => db.Prestamos.AsNoTracking().Include(x => x.Usuario).Include(x => x.Equipo).Include(x => x.Responsable);
    private Guid UsuarioActual() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private MovimientoEquipo Movimiento(Guid equipoId, Guid? prestamoId, string tipo, string descripcion) => new() { EquipoId = equipoId, PrestamoId = prestamoId, UsuarioId = UsuarioActual(), Tipo = tipo, Descripcion = descripcion };
    private static PrestamoDto Mapear(Prestamo x) => new(x.Id, x.FechaPrestamo, x.FechaDevolucionProgramada, x.FechaDevolucion, x.Motivo, x.Observacion, x.Estado, x.UsuarioId, x.Usuario?.NombreCompleto ?? "", x.Usuario?.Area ?? "", x.EquipoId, x.Equipo?.Nombre ?? "", x.Equipo?.CodigoPatrimonial ?? "", x.ResponsableId, x.Responsable?.NombreCompleto);
}
