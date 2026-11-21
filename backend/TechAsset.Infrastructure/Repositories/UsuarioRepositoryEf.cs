using Microsoft.EntityFrameworkCore;
using TechAsset.Application.Interfaces;
using TechAsset.Domain.Entities;
using TechAsset.Infrastructure.Data;

namespace TechAsset.Infrastructure.Repositories;

public class UsuarioRepositoryEf(AppDbContext db) : IUsuarioRepository
{
    public async Task AgregarAsync(Usuario usuario) { db.Usuarios.Add(usuario); await db.SaveChangesAsync(); }
    public async Task<IEnumerable<Usuario>> ListarAsync() => await db.Usuarios.AsNoTracking().OrderBy(x => x.NombreCompleto).ToListAsync();
    public Task<Usuario?> ObtenerPorIdAsync(Guid id) => db.Usuarios.FirstOrDefaultAsync(x => x.Id == id);
    public Task<Usuario?> ObtenerPorCorreoAsync(string correo) => db.Usuarios.FirstOrDefaultAsync(x => x.Correo.ToLower() == correo.Trim().ToLower());
    public Task<Usuario?> ObtenerPorTokenRecuperacionAsync(string tokenHash) => db.Usuarios.FirstOrDefaultAsync(x => x.RecuperacionTokenHash == tokenHash);
    public async Task ActualizarAsync(Usuario usuario) { db.Usuarios.Update(usuario); await db.SaveChangesAsync(); }
}

