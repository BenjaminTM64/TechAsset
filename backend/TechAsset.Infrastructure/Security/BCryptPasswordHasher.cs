using BCrypt.Net;
using TechAsset.Application.Interfaces;
using TechAsset.Application.Security;

namespace TechAsset.Infrastructure.Security;

public class BCryptPasswordHasher : IPasswordHasher
{
    public string CrearHash(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password);
    }

    public bool Verificar(string password, string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash)) return false;

        // Si es un hash BCrypt (inicia con $2a$, $2b$ o $2y$)
        if (passwordHash.StartsWith("$2"))
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, passwordHash);
            }
            catch (SaltParseException)
            {
                return false;
            }
        }

        // Compatibilidad transparente con usuarios iniciales / PBKDF2 para garantizar cero bloqueos
        return PasswordSecurity.Verify(password, passwordHash);
    }
}

