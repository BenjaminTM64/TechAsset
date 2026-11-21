using TechAsset.Application.DTOs.Usuarios;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Entities;
using TechAsset.Application.Security;

namespace TechAsset.Application.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _repository;
    private readonly IPasswordHasher _passwordHasher;

    public UsuarioService(IUsuarioRepository repository, IPasswordHasher passwordHasher)
    {
        _repository = repository;
        _passwordHasher = passwordHasher;
    }

    public UsuarioService(IUsuarioRepository repository)
        : this(repository, new FallbackPasswordHasher())
    {
    }

    public async Task<UsuarioDto> CrearAsync(CrearUsuarioDto dto)
    {
        if (await _repository.ObtenerPorCorreoAsync(dto.Correo) != null)
            throw new InvalidOperationException("El correo ya está registrado.");

        var usuario = new Usuario
        {
            Nombres = dto.Nombres.Trim(),
            Apellidos = dto.Apellidos.Trim(),
            Area = dto.Area.Trim(),
            NombreCompleto = $"{dto.Nombres.Trim()} {dto.Apellidos.Trim()}",
            Correo = dto.Correo.Trim().ToLowerInvariant(),
            Rol = NormalizarRol(dto.Rol),
            PasswordHash = _passwordHasher.CrearHash(dto.Password),
            Activo = true,
            DebeCambiarPassword = true
        };

        await _repository.AgregarAsync(usuario);

        return ConvertirDto(usuario);
    }

    public async Task<IEnumerable<UsuarioDto>> ListarAsync()
    {
        var usuarios = await _repository.ListarAsync();
        return usuarios.Select(ConvertirDto);
    }

    public async Task<UsuarioDto?> ObtenerPorIdAsync(Guid id)
    {
        var usuario = await _repository.ObtenerPorIdAsync(id);

        return usuario == null ? null : ConvertirDto(usuario);
    }

    public async Task<UsuarioDto?> ActualizarAsync(Guid id, ActualizarUsuarioDto dto)
    {
        var usuario = await _repository.ObtenerPorIdAsync(id);
        if (usuario is null) return null;
        var existente = await _repository.ObtenerPorCorreoAsync(dto.Correo.Trim());
        if (existente is not null && existente.Id != id)
            throw new InvalidOperationException("El correo ya está registrado.");

        usuario.Nombres = dto.Nombres.Trim();
        usuario.Apellidos = dto.Apellidos.Trim();
        usuario.Area = dto.Area.Trim();
        usuario.NombreCompleto = $"{usuario.Nombres} {usuario.Apellidos}";
        usuario.Correo = dto.Correo.Trim().ToLowerInvariant();
        usuario.Rol = NormalizarRol(dto.Rol);
        usuario.Activo = dto.Activo;
        await _repository.ActualizarAsync(usuario);
        return ConvertirDto(usuario);
    }

    public async Task<UsuarioDto?> DeshabilitarAsync(Guid id)
    {
        var usuario = await _repository.ObtenerPorIdAsync(id);
        if (usuario is null) return null;
        usuario.Activo = false;
        await _repository.ActualizarAsync(usuario);
        return ConvertirDto(usuario);
    }

    private static string NormalizarRol(string rol) => rol.Trim().ToLowerInvariant() switch
    {
        "administrador" => "Administrador",
        "responsable de tecnología" => "Responsable de Tecnología",
        "colaborador" => "Colaborador",
        _ => throw new ArgumentException("Rol inválido. Use Administrador, Responsable de Tecnología o Colaborador.")
    };

    private static UsuarioDto ConvertirDto(Usuario usuario)
    {
        return new UsuarioDto
        {
            Id = usuario.Id,
            NombreCompleto = usuario.NombreCompleto,
            Nombres = usuario.Nombres,
            Apellidos = usuario.Apellidos,
            Area = usuario.Area,
            Correo = usuario.Correo,
            Rol = usuario.Rol,
            Activo = usuario.Activo
        };
    }

    private sealed class FallbackPasswordHasher : IPasswordHasher
    {
        public string CrearHash(string password) => PasswordSecurity.Hash(password);
        public bool Verificar(string password, string passwordHash) => PasswordSecurity.Verify(password, passwordHash);
    }
}

