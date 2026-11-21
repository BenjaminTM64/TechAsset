using Microsoft.EntityFrameworkCore;
using TechAsset.Domain.Entities;

namespace TechAsset.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Equipo> Equipos => Set<Equipo>();
    public DbSet<Prestamo> Prestamos => Set<Prestamo>();
    public DbSet<MovimientoEquipo> MovimientosEquipo => Set<MovimientoEquipo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tabla de usuarios
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("usuarios");
            entity.HasKey(u => u.Id);

            entity.Property(u => u.NombreCompleto)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(u => u.Nombres).HasMaxLength(100).IsRequired();
            entity.Property(u => u.Apellidos).HasMaxLength(100).IsRequired();
            entity.Property(u => u.Area).HasMaxLength(100).IsRequired();

            entity.Property(u => u.Correo)
                .HasMaxLength(150)
                .IsRequired();

            entity.HasIndex(u => u.Correo).IsUnique();

            entity.Property(u => u.Rol)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(u => u.PasswordHash)
                .HasMaxLength(300)
                .IsRequired();

            entity.Property(u => u.RecuperacionTokenHash)
                .HasMaxLength(64);

            entity.HasIndex(u => u.RecuperacionTokenHash);
        });

        modelBuilder.Entity<Equipo>(entity =>
        {
            entity.ToTable("equipos");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.CodigoPatrimonial).HasMaxLength(50).IsRequired();
            entity.HasIndex(x => x.CodigoPatrimonial).IsUnique();
            entity.Property(x => x.Nombre).HasMaxLength(100).IsRequired();
            entity.Property(x => x.Categoria).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Marca).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Estado).HasMaxLength(30).IsRequired();
        });

        modelBuilder.Entity<Prestamo>(entity =>
        {
            entity.ToTable("prestamos");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.FechaPrestamo).IsRequired();
            entity.Property(x => x.FechaDevolucionProgramada).IsRequired();
            entity.Property(x => x.Motivo).HasMaxLength(300).IsRequired();
            entity.Property(x => x.Observacion).HasMaxLength(500);
            entity.Property(x => x.Estado).HasMaxLength(30).IsRequired();
            entity.HasOne(x => x.Usuario).WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Equipo).WithMany().HasForeignKey(x => x.EquipoId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Responsable).WithMany().HasForeignKey(x => x.ResponsableId).OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(x => new { x.EquipoId, x.Estado });
        });

        modelBuilder.Entity<MovimientoEquipo>(entity =>
        {
            entity.ToTable("movimientos_equipo");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Tipo).HasMaxLength(50).IsRequired();
            entity.Property(x => x.Descripcion).HasMaxLength(500).IsRequired();
            entity.HasOne(x => x.Equipo).WithMany().HasForeignKey(x => x.EquipoId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Prestamo).WithMany().HasForeignKey(x => x.PrestamoId).OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(x => x.Usuario).WithMany().HasForeignKey(x => x.UsuarioId).OnDelete(DeleteBehavior.SetNull);
        });
    }
}

