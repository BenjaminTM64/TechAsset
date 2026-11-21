using Microsoft.EntityFrameworkCore;
using TechAsset.Domain.Entities;

namespace TechAsset.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();
        var admin = await EnsureUser(db, "11111111-1111-1111-1111-111111111111", "Administrador", "TechAsset", "Tecnología", "admin@innovatech.com", "Administrador", "Admin123*");
        var responsable = await EnsureUser(db, "22222222-2222-2222-2222-222222222222", "Rosa", "Mendoza", "Tecnología", "responsable@innovatech.com", "Responsable de Tecnología", "Responsable123*");
        var colaborador = await EnsureUser(db, "33333333-3333-3333-3333-333333333333", "Carlos", "Ramírez", "Contabilidad", "colaborador@innovatech.com", "Colaborador", "Usuario123*");
        await db.SaveChangesAsync();

        if (!await db.Equipos.AnyAsync())
        {
            db.Equipos.AddRange(
                new Equipo { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), CodigoPatrimonial = "INV-LAP-001", Nombre = "Laptop Dell Latitude 5440", Categoria = "Laptop", Marca = "Dell", Estado = "Disponible" },
                new Equipo { Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), CodigoPatrimonial = "INV-PRO-002", Nombre = "Proyector Epson PowerLite", Categoria = "Proyector", Marca = "Epson", Estado = "Disponible" },
                new Equipo { Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"), CodigoPatrimonial = "INV-TAB-003", Nombre = "Tablet Samsung Galaxy Tab", Categoria = "Tablet", Marca = "Samsung", Estado = "Mantenimiento" });
        }
        await db.SaveChangesAsync();
    }

    private static async Task<Usuario> EnsureUser(AppDbContext db, string id, string nombres, string apellidos, string area, string correo, string rol, string password)
    {
        var user = await db.Usuarios.FirstOrDefaultAsync(x => x.Correo == correo);
        if (user is null)
        {
            user = new Usuario { Id = Guid.Parse(id), Correo = correo, PasswordHash = BCrypt.Net.BCrypt.HashPassword(password) };
            db.Usuarios.Add(user);
        }
        user.Nombres = nombres;
        user.Apellidos = apellidos;
        user.NombreCompleto = $"{nombres} {apellidos}";
        user.Area = area;
        user.Rol = rol;
        user.Activo = true;
        return user;
    }
}



