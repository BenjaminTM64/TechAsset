using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TechAsset.Application.DTOs.Equipos;
using TechAsset.Domain.Entities;
using TechAsset.Infrastructure.Data;

namespace TechAsset.API.Controllers;

[ApiController, Route("api/equipos"), Authorize]
public class EquiposController(AppDbContext db) : ControllerBase
{
    private static readonly string[] Estados = ["Disponible", "Prestado", "Mantenimiento", "Baja"];

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? estado, [FromQuery] string? categoria, [FromQuery] string? buscar)
    {
        var query = db.Equipos.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(estado)) query = query.Where(x => x.Estado.ToLower() == estado.Trim().ToLower());
        if (!string.IsNullOrWhiteSpace(categoria)) query = query.Where(x => x.Categoria.ToLower() == categoria.Trim().ToLower());
        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var text = buscar.Trim().ToLower();
            query = query.Where(x => x.CodigoPatrimonial.ToLower().Contains(text) || x.Nombre.ToLower().Contains(text) || x.Categoria.ToLower().Contains(text) || x.Marca.ToLower().Contains(text));
        }
        return Ok(await query
            .OrderBy(x => x.CodigoPatrimonial)
            .Select(x => new EquipoDto(
                x.Id,
                x.CodigoPatrimonial,
                x.Nombre,
                x.Categoria,
                x.Marca,
                x.Estado,
                db.Prestamos.Any(p => p.EquipoId == x.Id)))
            .ToListAsync());
    }

    [HttpGet("disponibles")]
    public async Task<IActionResult> Disponibles() => Ok(await db.Equipos
        .AsNoTracking()
        .Where(x => x.Estado == "Disponible")
        .OrderBy(x => x.Nombre)
        .Select(x => new EquipoDto(
            x.Id,
            x.CodigoPatrimonial,
            x.Nombre,
            x.Categoria,
            x.Marca,
            x.Estado,
            db.Prestamos.Any(p => p.EquipoId == x.Id)))
        .ToListAsync());

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Obtener(Guid id)
    {
        var equipo = await db.Equipos
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new EquipoDto(
                x.Id,
                x.CodigoPatrimonial,
                x.Nombre,
                x.Categoria,
                x.Marca,
                x.Estado,
                db.Prestamos.Any(p => p.EquipoId == x.Id)))
            .FirstOrDefaultAsync();
        return equipo is null ? NotFound(new { mensaje = "Equipo no encontrado." }) : Ok(equipo);
    }

    [HttpPost, Authorize(Roles = "Administrador,Responsable de Tecnología")]
    public async Task<IActionResult> Crear(GuardarEquipoDto dto)
    {
        var codigo = dto.CodigoPatrimonial.Trim().ToUpperInvariant();
        if (await db.Equipos.AnyAsync(x => x.CodigoPatrimonial == codigo)) return Conflict(new { mensaje = "El código patrimonial ya está registrado." });
        var estado = NormalizarEstado(dto.Estado);
        if (estado == "Prestado") return BadRequest(new { mensaje = "Un equipo solo pasa a Prestado cuando se aprueba un préstamo." });
        var equipo = new Equipo { CodigoPatrimonial = codigo, Nombre = dto.Nombre.Trim(), Categoria = dto.Categoria.Trim(), Marca = dto.Marca.Trim(), Estado = estado };
        db.Equipos.Add(equipo);
        db.MovimientosEquipo.Add(Movimiento(equipo.Id, null, "Registro", $"Equipo {codigo} registrado con estado {estado}."));
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Obtener), new { id = equipo.Id }, Mapear(equipo, false));
    }

    [HttpPut("{id:guid}"), Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Actualizar(Guid id, GuardarEquipoDto dto)
    {
        var equipo = await db.Equipos.FirstOrDefaultAsync(x => x.Id == id);
        if (equipo is null) return NotFound(new { mensaje = "Equipo no encontrado." });
        var codigo = dto.CodigoPatrimonial.Trim().ToUpperInvariant();
        if (await db.Equipos.AnyAsync(x => x.CodigoPatrimonial == codigo && x.Id != id)) return Conflict(new { mensaje = "El código patrimonial ya está registrado." });
        var estado = NormalizarEstado(dto.Estado);
        var prestamoActivo = await db.Prestamos.AnyAsync(x => x.EquipoId == id && x.Estado == "Activo");
        if (prestamoActivo && estado != "Prestado") return Conflict(new { mensaje = "El equipo tiene un préstamo activo. Registra primero la devolución." });
        if (!prestamoActivo && estado == "Prestado") return BadRequest(new { mensaje = "El estado Prestado solo se asigna al aprobar un préstamo." });
        var anterior = equipo.Estado;
        equipo.CodigoPatrimonial = codigo;
        equipo.Nombre = dto.Nombre.Trim();
        equipo.Categoria = dto.Categoria.Trim();
        equipo.Marca = dto.Marca.Trim();
        equipo.Estado = estado;
        if (anterior != estado) db.MovimientosEquipo.Add(Movimiento(equipo.Id, null, "Cambio de estado", $"Estado actualizado de {anterior} a {estado}."));
        await db.SaveChangesAsync();
        var tieneHistorial = await db.Prestamos.AnyAsync(x => x.EquipoId == id);
        return Ok(Mapear(equipo, tieneHistorial));
    }

    [HttpDelete("{id:guid}"), Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Eliminar(Guid id)
    {
        var equipo = await db.Equipos.FirstOrDefaultAsync(x => x.Id == id);
        if (equipo is null) return NotFound(new { mensaje = "Equipo no encontrado." });

        // RN-06: solo se elimina un registro sin préstamos; el historial nunca se borra.
        if (await db.Prestamos.AnyAsync(x => x.EquipoId == id))
            return Conflict(new { mensaje = "No se puede eliminar el equipo porque tiene historial de préstamos. Puedes marcarlo como Baja para conservar la trazabilidad." });

        var movimientosSinPrestamo = await db.MovimientosEquipo
            .Where(x => x.EquipoId == id && x.PrestamoId == null)
            .ToListAsync();
        db.MovimientosEquipo.RemoveRange(movimientosSinPrestamo);
        db.Equipos.Remove(equipo);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private MovimientoEquipo Movimiento(Guid equipoId, Guid? prestamoId, string tipo, string descripcion) => new() { EquipoId = equipoId, PrestamoId = prestamoId, UsuarioId = Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null, Tipo = tipo, Descripcion = descripcion };
    private static string NormalizarEstado(string value) => Estados.FirstOrDefault(x => x.Equals(value.Trim(), StringComparison.OrdinalIgnoreCase)) ?? throw new ArgumentException("Estado inválido. Use Disponible, Mantenimiento o Baja.");
    private static EquipoDto Mapear(Equipo x, bool tieneHistorial) => new(x.Id, x.CodigoPatrimonial, x.Nombre, x.Categoria, x.Marca, x.Estado, tieneHistorial);
}
