using TechAsset.Domain.Entities;

namespace TechAsset.Application.Interfaces;

public interface IUsuarioRepository
{
    Task AgregarAsync(Usuario usuario);

    Task<IEnumerable<Usuario>> ListarAsync();

    Task<Usuario?> ObtenerPorIdAsync(Guid id);

    Task<Usuario?> ObtenerPorCorreoAsync(string correo);
    Task<Usuario?> ObtenerPorTokenRecuperacionAsync(string tokenHash);
    Task ActualizarAsync(Usuario usuario);
}

