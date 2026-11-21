namespace TechAsset.Application.Interfaces;

public interface IPasswordHasher
{
    string CrearHash(string password);
    bool Verificar(string password, string passwordHash);
}

