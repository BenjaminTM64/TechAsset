namespace TechAsset.Domain.Entities;

public class Usuario
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string NombreCompleto { get; set; } = string.Empty;

    public string Nombres { get; set; } = string.Empty;

    public string Apellidos { get; set; } = string.Empty;

    public string Area { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Rol { get; set; } = "Colaborador";

    public string PasswordHash { get; set; } = string.Empty;

    public bool Activo { get; set; } = true;

    public bool DebeCambiarPassword { get; set; }

    public string? RecuperacionTokenHash { get; set; }

    public DateTime? RecuperacionExpiraUtc { get; set; }
}

