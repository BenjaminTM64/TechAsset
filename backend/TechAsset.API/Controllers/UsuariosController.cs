using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TechAsset.Application.DTOs.Usuarios;
using TechAsset.Application.Interfaces;
using System.Security.Claims;

namespace TechAsset.API.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize(Roles = "Administrador")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    // RF-01: Registrar usuario
    [HttpPost]
    public async Task<IActionResult> Crear(
        [FromBody] CrearUsuarioDto dto)
    {
        try
        {
            var usuario = await _usuarioService.CrearAsync(dto);

            return CreatedAtAction(
                nameof(ObtenerPorId),
                new { id = usuario.Id },
                usuario
            );
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
    }

    // Listar usuarios
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var usuarios = await _usuarioService.ListarAsync();

        return Ok(usuarios);
    }

    // Consultar usuario por ID
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObtenerPorId(Guid id)
    {
        var usuario = await _usuarioService.ObtenerPorIdAsync(id);

        if (usuario == null)
        {
            return NotFound(
                new { mensaje = "Usuario no encontrado." }
            );
        }

        return Ok(usuario);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Actualizar(Guid id, ActualizarUsuarioDto dto)
    {
        try
        {
            var usuario = await _usuarioService.ActualizarAsync(id, dto);
            return usuario is null ? NotFound(new { mensaje = "Usuario no encontrado." }) : Ok(usuario);
        }
        catch (InvalidOperationException ex) { return Conflict(new { mensaje = ex.Message }); }
    }

    // RF-04 y RN-09: acción exclusiva y explícita del Administrador.
    [HttpPatch("{id:guid}/deshabilitar")]
    public async Task<IActionResult> Deshabilitar(Guid id)
    {
        if (Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var actualId) && actualId == id)
            return Conflict(new { mensaje = "No puedes deshabilitar tu propia cuenta mientras la estás utilizando." });

        var usuario = await _usuarioService.DeshabilitarAsync(id);
        return usuario is null
            ? NotFound(new { mensaje = "Usuario no encontrado." })
            : Ok(usuario);
    }
}

