using System.ComponentModel.DataAnnotations;

namespace TechAsset.Application.DTOs.Prestamos;

public record PrestamoDto(Guid Id, DateOnly FechaPrestamo, DateOnly FechaDevolucionProgramada, DateOnly? FechaDevolucion, string Motivo, string? Observacion, string Estado, Guid UsuarioId, string Colaborador, string Area, Guid EquipoId, string Equipo, string CodigoPatrimonial, Guid? ResponsableId, string? Responsable);

public class CrearPrestamoDto
{
    [Required] public DateOnly FechaPrestamo { get; set; }
    [Required] public DateOnly FechaDevolucionProgramada { get; set; }
    [Required, StringLength(300, MinimumLength = 5)] public string Motivo { get; set; } = string.Empty;
    [Required] public Guid EquipoId { get; set; }
}

public class RegistrarDevolucionDto
{
    [Required] public DateOnly FechaDevolucion { get; set; }
    [Required, StringLength(500, MinimumLength = 5)] public string Observacion { get; set; } = string.Empty;
}

public class RechazarPrestamoDto
{
    [Required, StringLength(300, MinimumLength = 5)] public string Observacion { get; set; } = string.Empty;
}

public record MovimientoDto(Guid Id, DateTime FechaUtc, string Tipo, string Descripcion, Guid EquipoId, string Equipo, string CodigoPatrimonial, Guid? PrestamoId, string? Usuario);
