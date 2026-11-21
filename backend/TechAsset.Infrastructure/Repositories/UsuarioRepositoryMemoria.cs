using TechAsset.Application.Interfaces;
using TechAsset.Domain.Entities;

namespace TechAsset.Infrastructure.Repositories;

public class UsuarioRepositoryMemoria : IUsuarioRepository
{
    private static readonly object Sync = new();
    private static readonly List<Usuario> Usuarios =
    [
        new Usuario { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), NombreCompleto = "Administrador TechAsset", Correo = "admin@innovatech.com", Rol = "Administrador" },
        new Usuario { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), NombreCompleto = "Responsable de Tecnología", Correo = "responsable@innovatech.com", Rol = "Responsable de Tecnología" },
        new Usuario { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), NombreCompleto = "Colaborador Innovatech", Correo = "colaborador@innovatech.com", Rol = "Colaborador" }
    ];

    public Task AgregarAsync(Usuario usuario)
    {
        lock (Sync) Usuarios.Add(usuario);
        return Task.CompletedTask;
    }

    public Task<IEnumerable<Usuario>> ListarAsync()
    {
        lock (Sync) return Task.FromResult<IEnumerable<Usuario>>(Usuarios.ToList());
    }

    public Task<Usuario?> ObtenerPorIdAsync(Guid id)
    {
        return Task.FromResult(
            Usuarios.FirstOrDefault(u => u.Id == id)
        );
    }

    public Task<Usuario?> ObtenerPorCorreoAsync(string correo)
    {
        return Task.FromResult(
            Usuarios.FirstOrDefault(u =>
                u.Correo.Equals(correo, StringComparison.OrdinalIgnoreCase))
        );
    }

    public Task<Usuario?> ObtenerPorTokenRecuperacionAsync(string tokenHash)
    {
        lock (Sync) return Task.FromResult(Usuarios.FirstOrDefault(u => u.RecuperacionTokenHash == tokenHash));
    }

    public Task ActualizarAsync(Usuario usuario) => Task.CompletedTask;
}



