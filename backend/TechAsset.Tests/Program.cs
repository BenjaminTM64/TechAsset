using TechAsset.Application.DTOs.Usuarios;
using TechAsset.Application.Interfaces;
using TechAsset.Application.Security;
using TechAsset.Application.Services;
using TechAsset.Domain.Entities;

var passed = 0;

await Test("Protege y verifica contraseñas", () =>
{
    const string password = "TechAsset2026*";
    var hash = PasswordSecurity.Hash(password);

    Assert(hash != password, "La contraseña no debe almacenarse como texto plano.");
    Assert(PasswordSecurity.Verify(password, hash), "La contraseña correcta debe validarse.");
    Assert(!PasswordSecurity.Verify("Incorrecta2026*", hash), "Una contraseña incorrecta debe rechazarse.");

    return Task.CompletedTask;
});

await Test("Registra un usuario con datos normalizados", async () =>
{
    var repository = new InMemoryUserRepository();
    var service = new UsuarioService(repository);
    var created = await service.CrearAsync(NewUser("  QA.Prueba@Innovatech.com  "));

    Assert(created.Correo == "qa.prueba@innovatech.com", "El correo debe guardarse en minúsculas.");
    Assert(created.Rol == "Colaborador", "El rol debe normalizarse.");
    Assert(created.Activo, "Una cuenta nueva debe quedar activa.");
    Assert(repository.Items.Single().DebeCambiarPassword, "La contraseña temporal debe cambiarse al ingresar.");
});

await Test("Impide correos duplicados", async () =>
{
    var repository = new InMemoryUserRepository();
    var service = new UsuarioService(repository);

    await service.CrearAsync(NewUser("persona@innovatech.com"));
    await Throws<InvalidOperationException>(() => service.CrearAsync(NewUser("PERSONA@innovatech.com")));
});

Console.WriteLine($"\n{passed} comprobaciones de TechAsset superadas.");

static CrearUsuarioDto NewUser(string email) => new()
{
    Nombres = "Persona",
    Apellidos = "Prueba",
    Area = "Calidad",
    Correo = email,
    Rol = "colaborador",
    Password = "TechAsset2026*",
};

async Task Test(string name, Func<Task> action)
{
    try
    {
        await action();
        passed++;
        Console.WriteLine($"OK  {name}");
    }
    catch (Exception exception)
    {
        Console.Error.WriteLine($"ERROR  {name}: {exception.Message}");
        Environment.ExitCode = 1;
    }
}

static void Assert(bool condition, string message)
{
    if (!condition) throw new InvalidOperationException(message);
}

static async Task Throws<TException>(Func<Task> action) where TException : Exception
{
    try
    {
        await action();
    }
    catch (TException)
    {
        return;
    }

    throw new InvalidOperationException($"Se esperaba la excepción {typeof(TException).Name}.");
}

sealed class InMemoryUserRepository : IUsuarioRepository
{
    public List<Usuario> Items { get; } = [];

    public Task AgregarAsync(Usuario usuario)
    {
        Items.Add(usuario);
        return Task.CompletedTask;
    }

    public Task ActualizarAsync(Usuario usuario) => Task.CompletedTask;

    public Task<IEnumerable<Usuario>> ListarAsync() => Task.FromResult<IEnumerable<Usuario>>(Items);

    public Task<Usuario?> ObtenerPorCorreoAsync(string correo) => Task.FromResult(
        Items.FirstOrDefault(user => user.Correo.Equals(correo.Trim(), StringComparison.OrdinalIgnoreCase)));

    public Task<Usuario?> ObtenerPorIdAsync(Guid id) =>
        Task.FromResult(Items.FirstOrDefault(user => user.Id == id));

    public Task<Usuario?> ObtenerPorTokenRecuperacionAsync(string tokenHash) => Task.FromResult(
        Items.FirstOrDefault(user => user.RecuperacionTokenHash == tokenHash));
}
