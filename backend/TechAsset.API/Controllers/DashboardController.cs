using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TechAsset.Infrastructure.Data;

namespace TechAsset.API.Controllers;

[ApiController, Route("api/dashboard"), Authorize]
public class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Obtener()
    {
        var equipos = await db.Equipos.AsNoTracking().ToListAsync();
        var query = db.Prestamos.AsNoTracking().Include(x => x.Usuario).Include(x => x.Equipo).AsQueryable();
        if (User.IsInRole("Colaborador"))
        {
            var id = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            query = query.Where(x => x.UsuarioId == id);
        }
        var prestamos = await query.ToListAsync();
        var equipoMasUtilizado = prestamos.GroupBy(x => x.Equipo?.Nombre ?? "").OrderByDescending(x => x.Count()).Select(x => new { nombre = x.Key, cantidad = x.Count() }).FirstOrDefault();
        var areaMayorUso = prestamos.Where(x => !string.IsNullOrWhiteSpace(x.Usuario!.Area)).GroupBy(x => x.Usuario!.Area).OrderByDescending(x => x.Count()).Select(x => new { area = x.Key, cantidad = x.Count() }).FirstOrDefault();
        return Ok(new
        {
            totalEquipos = equipos.Count,
            equiposDisponibles = equipos.Count(x => x.Estado == "Disponible"),
            equiposPrestados = equipos.Count(x => x.Estado == "Prestado"),
            equiposMantenimiento = equipos.Count(x => x.Estado == "Mantenimiento"),
            equiposBaja = equipos.Count(x => x.Estado == "Baja"),
            totalPrestamos = prestamos.Count,
            prestamosPendientes = prestamos.Count(x => x.Estado == "Pendiente"),
            prestamosActivos = prestamos.Count(x => x.Estado == "Activo"),
            prestamosDevueltos = prestamos.Count(x => x.Estado == "Devuelto"),
            prestamosRechazados = prestamos.Count(x => x.Estado == "Rechazado"),
            equipoMasUtilizado = equipoMasUtilizado?.nombre,
            usosEquipoMasUtilizado = equipoMasUtilizado?.cantidad ?? 0,
            areaMayorUso = areaMayorUso?.area,
            prestamosAreaMayorUso = areaMayorUso?.cantidad ?? 0,
            usuariosActivos = await db.Usuarios.CountAsync(x => x.Activo)
        });
    }
}
