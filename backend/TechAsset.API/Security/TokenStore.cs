using System.Collections.Concurrent;

namespace TechAsset.API.Security;

public record AuthenticatedUser(Guid Id, string Nombre, string Correo, string Rol, bool RequiereCambioPassword);

public interface ITokenStore
{
    string Create(AuthenticatedUser user);
    AuthenticatedUser? Get(string token);
    void Revoke(string token);
}

public class TokenStore : ITokenStore
{
    private readonly ConcurrentDictionary<string, AuthenticatedUser> _tokens = new();
    public string Create(AuthenticatedUser user) { var token = Convert.ToHexString(Guid.NewGuid().ToByteArray()) + Convert.ToHexString(Guid.NewGuid().ToByteArray()); _tokens[token] = user; return token; }
    public AuthenticatedUser? Get(string token) => _tokens.TryGetValue(token, out var user) ? user : null;
    public void Revoke(string token) => _tokens.TryRemove(token, out _);
}

