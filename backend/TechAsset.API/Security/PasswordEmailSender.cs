using System.Net;
using System.Net.Mail;

namespace TechAsset.API.Security;

public interface IPasswordEmailSender
{
    Task SendResetLinkAsync(string destination, string userName, string resetLink);
}

public class PasswordEmailSender(IConfiguration configuration, IWebHostEnvironment environment, ILogger<PasswordEmailSender> logger) : IPasswordEmailSender
{
    public async Task SendResetLinkAsync(string destination, string userName, string resetLink)
    {
        var host = configuration["Email:Smtp:Host"];
        if (string.IsNullOrWhiteSpace(host))
        {
            if (environment.IsDevelopment())
            {
                logger.LogWarning("Correo de recuperación para {Destination}: {ResetLink}", destination, resetLink);
                return;
            }
            throw new InvalidOperationException("El servicio de correo no está configurado.");
        }

        var port = configuration.GetValue("Email:Smtp:Port", 587);
        var user = configuration["Email:Smtp:User"] ?? string.Empty;
        var password = configuration["Email:Smtp:Password"] ?? string.Empty;
        var from = configuration["Email:Smtp:From"] ?? user;
        using var message = new MailMessage(from, destination)
        {
            Subject = "Restablece tu contraseña de TechAsset",
            Body = $"Hola {userName},\n\nRecibimos una solicitud para restablecer tu contraseña. " +
                   $"Abre este enlace, válido por 30 minutos:\n{resetLink}\n\n" +
                   "Si no solicitaste el cambio, ignora este mensaje.",
            IsBodyHtml = false
        };
        using var client = new SmtpClient(host, port)
        {
            EnableSsl = configuration.GetValue("Email:Smtp:EnableSsl", true),
            Credentials = new NetworkCredential(user, password)
        };
        await client.SendMailAsync(message);
    }
}

