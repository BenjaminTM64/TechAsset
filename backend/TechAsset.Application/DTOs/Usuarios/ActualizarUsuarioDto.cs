using System.ComponentModel.DataAnnotations;

namespace TechAsset.Application.DTOs.Usuarios;

public class ActualizarUsuarioDto
{
    [Required(ErrorMessage = "Ingrese su nombre.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Ingrese su nombre.")]
    public string Nombres { get; set; } = string.Empty;
    [Required(ErrorMessage = "Ingrese sus apellidos.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Ingrese sus apellidos.")]
    public string Apellidos { get; set; } = string.Empty;
    [Required, StringLength(100, MinimumLength = 2)]
    public string Area { get; set; } = string.Empty;
    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "Ingrese un correo válido.")]
    [RegularExpression(@"^[^\s@]+@innovatech\.com$", ErrorMessage = "El correo debe pertenecer al dominio institucional @innovatech.com.")]
    [StringLength(150)]
    public string Correo { get; set; } = string.Empty;
    [Required]
    public string Rol { get; set; } = "Colaborador";
    public bool Activo { get; set; } = true;
}



