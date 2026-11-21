using System.ComponentModel.DataAnnotations;

namespace TechAsset.Application.DTOs.Equipos;

public record EquipoDto(Guid Id, string CodigoPatrimonial, string Nombre, string Categoria, string Marca, string Estado, bool TieneHistorial);

public class GuardarEquipoDto
{
    [Required, StringLength(50, MinimumLength = 3)] public string CodigoPatrimonial { get; set; } = string.Empty;
    [Required, StringLength(100, MinimumLength = 2)] public string Nombre { get; set; } = string.Empty;
    [Required, StringLength(50, MinimumLength = 2)] public string Categoria { get; set; } = string.Empty;
    [Required, StringLength(50, MinimumLength = 2)] public string Marca { get; set; } = string.Empty;
    [Required] public string Estado { get; set; } = "Disponible";
}
