using System.ComponentModel.DataAnnotations;

namespace TechAsset.Application.DTOs.Usuarios;

public class CrearUsuarioDto
{
    [Required(ErrorMessage = "Ingrese su nombre.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Ingrese su nombre.")]
    public string Nombres { get; set; } = string.Empty;

    [Required(ErrorMessage = "Ingrese sus apellidos.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Ingrese sus apellidos.")]
    public string Apellidos { get; set; } = string.Empty;

    [Required(ErrorMessage = "El área es obligatoria."), StringLength(100, MinimumLength = 2)]
    public string Area { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "Ingrese un correo válido.")]
    [RegularExpression(@"^[^\s@]+@innovatech\.com$", ErrorMessage = "El correo debe pertenecer al dominio institucional @innovatech.com.")]
    [StringLength(150)]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rol es obligatorio.")]
    public string Rol { get; set; } = "Colaborador";

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres.")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$",
        ErrorMessage = "La contraseña debe incluir mayúscula, minúscula, número y símbolo.")]
    public string Password { get; set; } = string.Empty;
}



