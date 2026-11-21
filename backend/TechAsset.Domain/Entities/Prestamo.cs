namespace TechAsset.Domain.Entities;

public class Prestamo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateOnly FechaPrestamo { get; set; }
    public DateOnly FechaDevolucionProgramada { get; set; }
    public DateOnly? FechaDevolucion { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string? Observacion { get; set; }
    public string Estado { get; set; } = "Pendiente";
    public Guid UsuarioId { get; set; }
    public Guid EquipoId { get; set; }
    public Guid? ResponsableId { get; set; }
    public Usuario? Usuario { get; set; }
    public Equipo? Equipo { get; set; }
    public Usuario? Responsable { get; set; }
}
