using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using TechAsset.API;
using TechAsset.API.Middleware;
using TechAsset.API.Security;
using TechAsset.Application.Interfaces;
using TechAsset.Application.Services;
using TechAsset.Infrastructure.Data;
using TechAsset.Infrastructure.Repositories;
using TechAsset.Infrastructure.Security;

var builder = WebApplication.CreateBuilder(args);

// Los secretos locales permanecen fuera de Git y pueden sustituirse por variables de entorno.
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: false);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services
    .AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, ".keys")));

var baseConnectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("No se configuró la conexión a PostgreSQL.");
var techAssetConnection = new Npgsql.NpgsqlConnectionStringBuilder(baseConnectionString)
{
    Database = builder.Configuration["DatabaseName"] ?? "techasset"
}.ConnectionString;
builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(techAssetConnection));
builder.Services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepositoryEf>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddSingleton<ITokenStore, TokenStore>();
builder.Services.AddScoped<IPasswordEmailSender, PasswordEmailSender>();
builder.Services
    .AddAuthentication("BearerToken")
    .AddScheme<AuthenticationSchemeOptions, TokenAuthenticationHandler>("BearerToken", null);
builder.Services.AddAuthorization();
builder.Services.AddCors(options => options.AddPolicy(
    "Frontend",
    policy => policy
        .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

// Aplica migraciones y datos iniciales antes de aceptar solicitudes.
using (var scope = app.Services.CreateScope())
{
    await DbInitializer.InitializeAsync(scope.ServiceProvider.GetRequiredService<AppDbContext>());
}

if (app.Environment.IsDevelopment())
{
    app.MapGet("/swagger/v1/swagger.json", () => Results.Json(OpenApiDocument.Create()));
    app.MapGet("/swagger", () => Results.Content(SwaggerPage.Html, "text/html"));
}

app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseMiddleware<PasswordChangeRequiredMiddleware>();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program;

