using System.Security.Claims;

namespace TechAsset.API.Middleware;

public class PasswordChangeRequiredMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var requiresChange = context.User.Identity?.IsAuthenticated == true &&
                             context.User.FindFirstValue("cambio_password_requerido") == "true";
        var allowedPath = context.Request.Path.StartsWithSegments("/api/auth/cambiar-password-inicial") ||
                          context.Request.Path.StartsWithSegments("/api/auth/logout");
        if (requiresChange && !allowedPath)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { mensaje = "Debes reemplazar la contraseña temporal antes de continuar." });
            return;
        }
        await next(context);
    }
}

