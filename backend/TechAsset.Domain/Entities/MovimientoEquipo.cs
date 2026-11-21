namespace TechAsset.Domain.Entities;

public class MovimientoEquipo
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime FechaUtc { get; set; } = DateTime.UtcNow;
    public string Tipo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public Guid EquipoId { get; set; }
    public Guid? PrestamoId { get; set; }
    public Guid? UsuarioId { get; set; }
    public Equipo? Equipo { get; set; }
    public Prestamo? Prestamo { get; set; }
    public Usuario? Usuario { get; set; }
}
