using System.ComponentModel.DataAnnotations;

namespace TechAsset.Application.DTOs.Auth;

public class LoginDto
{
    [Required, EmailAddress] public string Correo { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public record LoginResponseDto(string Token, Guid Id, string NombreCompleto, string Correo, string Rol, bool RequiereCambioPassword);

public class CambiarPasswordInicialDto
{
    [Required, StringLength(100, MinimumLength = 8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$", ErrorMessage = "La contraseña debe incluir mayúscula, minúscula, número y símbolo.")]
    public string NuevaPassword { get; set; } = string.Empty;
    [Required, Compare(nameof(NuevaPassword), ErrorMessage = "Las contraseñas no coinciden.")] public string ConfirmarPassword { get; set; } = string.Empty;
}

public class SolicitarRecuperacionDto
{
    [Required, EmailAddress]
    [RegularExpression(@"^[^\s@]+@innovatech\.com$", ErrorMessage = "Ingresa un correo institucional @innovatech.com.")]
    public string Correo { get; set; } = string.Empty;
}

public class RestablecerPasswordDto : CambiarPasswordInicialDto
{
    [Required] public string Token { get; set; } = string.Empty;
}



