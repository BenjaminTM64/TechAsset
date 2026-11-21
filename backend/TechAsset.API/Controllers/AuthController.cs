using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechAsset.API.Security;
using TechAsset.Application.DTOs.Auth;
using TechAsset.Application.Interfaces;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;

namespace TechAsset.API.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(
    IUsuarioRepository usuarios,
    ITokenStore tokens,
    IPasswordEmailSender emailSender,
    IConfiguration configuration,
    ILogger<AuthController> logger,
    IPasswordHasher passwordHasher) : ControllerBase
{
    [HttpPost("login"), AllowAnonymous]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var usuario = await usuarios.ObtenerPorCorreoAsync(dto.Correo);
        if (usuario is null || !usuario.Activo || !passwordHasher.Verificar(dto.Password, usuario.PasswordHash))
            return Unauthorized(new { mensaje = "Correo o contraseña incorrectos." });
        var token = tokens.Create(new AuthenticatedUser(usuario.Id, usuario.NombreCompleto, usuario.Correo, usuario.Rol, usuario.DebeCambiarPassword));
        return Ok(new LoginResponseDto(token, usuario.Id, usuario.NombreCompleto, usuario.Correo, usuario.Rol, usuario.DebeCambiarPassword));
    }

    [HttpPost("cambiar-password-inicial"), Authorize]
    public async Task<IActionResult> CambiarPasswordInicial(CambiarPasswordInicialDto dto)
    {
        var id = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var usuario = await usuarios.ObtenerPorIdAsync(id);
        if (usuario is null) return NotFound(new { mensaje = "Usuario no encontrado." });
        if (!usuario.DebeCambiarPassword) return Conflict(new { mensaje = "La contraseña temporal ya fue reemplazada." });
        if (passwordHasher.Verificar(dto.NuevaPassword, usuario.PasswordHash)) return BadRequest(new { mensaje = "La nueva contraseña debe ser diferente de la temporal." });
        usuario.PasswordHash = passwordHasher.CrearHash(dto.NuevaPassword);
        usuario.DebeCambiarPassword = false;
        await usuarios.ActualizarAsync(usuario);
        RevokeCurrentToken();
        return NoContent();
    }

    [HttpPost("olvide-password"), AllowAnonymous]
    public async Task<IActionResult> SolicitarRecuperacion(SolicitarRecuperacionDto dto)
    {
        var usuario = await usuarios.ObtenerPorCorreoAsync(dto.Correo);
        if (usuario is not null && usuario.Activo)
        {
            var token = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(32));
            usuario.RecuperacionTokenHash = HashToken(token);
            usuario.RecuperacionExpiraUtc = DateTime.UtcNow.AddMinutes(30);
            await usuarios.ActualizarAsync(usuario);
            var baseUrl = configuration["Frontend:BaseUrl"] ?? "http://127.0.0.1:5173";
            var link = $"{baseUrl.TrimEnd('/')}?resetToken={Uri.EscapeDataString(token)}";
            try { await emailSender.SendResetLinkAsync(usuario.Correo, usuario.NombreCompleto, link); }
            catch (Exception ex) { logger.LogError(ex, "No se pudo enviar el correo de recuperación a {Correo}", usuario.Correo); }
        }
        return Ok(new { mensaje = "Si la cuenta existe y está activa, recibirás un enlace válido por 30 minutos." });
    }

    [HttpPost("restablecer-password"), AllowAnonymous]
    public async Task<IActionResult> RestablecerPassword(RestablecerPasswordDto dto)
    {
        var usuario = await usuarios.ObtenerPorTokenRecuperacionAsync(HashToken(dto.Token));
        if (usuario is null || usuario.RecuperacionExpiraUtc is null || usuario.RecuperacionExpiraUtc <= DateTime.UtcNow)
            return BadRequest(new { mensaje = "El enlace de recuperación no es válido o ya venció." });
        if (passwordHasher.Verificar(dto.NuevaPassword, usuario.PasswordHash))
            return BadRequest(new { mensaje = "La nueva contraseña debe ser diferente de la anterior." });
        usuario.PasswordHash = passwordHasher.CrearHash(dto.NuevaPassword);
        usuario.DebeCambiarPassword = false;
        usuario.RecuperacionTokenHash = null;
        usuario.RecuperacionExpiraUtc = null;
        await usuarios.ActualizarAsync(usuario);
        return Ok(new { mensaje = "Contraseña restablecida correctamente. Ya puedes iniciar sesión." });
    }

    [HttpPost("logout"), Authorize]
    public IActionResult Logout()
    {
        RevokeCurrentToken();
        return NoContent();
    }

    private void RevokeCurrentToken()
    {
        var value = Request.Headers.Authorization.FirstOrDefault();
        if (value?.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) == true) tokens.Revoke(value[7..].Trim());
    }

    private static string HashToken(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}

