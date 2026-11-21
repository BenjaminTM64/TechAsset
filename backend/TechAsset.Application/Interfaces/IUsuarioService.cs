using TechAsset.Application.DTOs.Usuarios;

namespace TechAsset.Application.Interfaces;

public interface IUsuarioService
{
    Task<UsuarioDto> CrearAsync(CrearUsuarioDto dto);

    Task<IEnumerable<UsuarioDto>> ListarAsync();

    Task<UsuarioDto?> ObtenerPorIdAsync(Guid id);
    Task<UsuarioDto?> ActualizarAsync(Guid id, ActualizarUsuarioDto dto);
    Task<UsuarioDto?> DeshabilitarAsync(Guid id);
}

