using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechAsset.Application.DTOs.Prestamos;
using TechAsset.Infrastructure.Data;

namespace TechAsset.API.Controllers;

[ApiController, Route("api/reportes"), Authorize(Roles = "Administrador")]
public class ReportesController(AppDbContext db) : ControllerBase
{
    [HttpGet("equipos-por-estado")]
    public async Task<IActionResult> EquiposPorEstado() => Ok(await db.Equipos.AsNoTracking().GroupBy(x => x.Estado).Select(x => new { estado = x.Key, cantidad = x.Count() }).OrderBy(x => x.estado).ToListAsync());

    [HttpGet("equipos-mas-utilizados")]
    public async Task<IActionResult> EquiposMasUtilizados() => Ok(await db.Prestamos.AsNoTracking().Include(x => x.Equipo).GroupBy(x => new { x.EquipoId, x.Equipo!.Nombre, x.Equipo.CodigoPatrimonial }).Select(x => new { equipoId = x.Key.EquipoId, equipo = x.Key.Nombre, codigoPatrimonial = x.Key.CodigoPatrimonial, cantidad = x.Count() }).OrderByDescending(x => x.cantidad).Take(10).ToListAsync());

    [HttpGet("prestamos-por-area"), Authorize(Roles = "Administrador")]
    public async Task<IActionResult> PrestamosPorArea() => Ok(await db.Prestamos.AsNoTracking().Include(x => x.Usuario).GroupBy(x => x.Usuario!.Area).Select(x => new { area = string.IsNullOrEmpty(x.Key) ? "Sin área" : x.Key, cantidad = x.Count() }).OrderByDescending(x => x.cantidad).ToListAsync());

    [HttpGet("movimientos")]
    public async Task<IActionResult> Movimientos([FromQuery] int limite = 50)
    {
        limite = Math.Clamp(limite, 1, 200);
        var items = await db.MovimientosEquipo.AsNoTracking().Include(x => x.Equipo).Include(x => x.Usuario).OrderByDescending(x => x.FechaUtc).Take(limite).ToListAsync();
        return Ok(items.Select(x => new MovimientoDto(x.Id, x.FechaUtc, x.Tipo, x.Descripcion, x.EquipoId, x.Equipo?.Nombre ?? "", x.Equipo?.CodigoPatrimonial ?? "", x.PrestamoId, x.Usuario?.NombreCompleto)));
    }
}
