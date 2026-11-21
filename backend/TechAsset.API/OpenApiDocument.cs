namespace TechAsset.API;

public static class OpenApiDocument
{
    public static object Create() => new
    {
        openapi = "3.0.1",
        info = new { title = "TechAsset API", version = "v1", description = "API para la gestión de usuarios, inventario tecnológico, préstamos, devoluciones y reportes de Innovatech." },
        servers = new[] { new { url = "http://localhost:5264" } },
        components = new { securitySchemes = new { BearerToken = new { type = "http", scheme = "bearer", description = "Token devuelto por /api/auth/login" } } },
        paths = new Dictionary<string, object>
        {
            ["/api/auth/login"] = Ops("Autenticación", false, "post"),
            ["/api/auth/cambiar-password-inicial"] = Ops("Autenticación", true, "post"),
            ["/api/auth/olvide-password"] = Ops("Autenticación", false, "post"),
            ["/api/auth/restablecer-password"] = Ops("Autenticación", false, "post"),
            ["/api/usuarios"] = Ops("Usuarios", true, "get", "post"),
            ["/api/usuarios/{id}"] = Ops("Usuarios", true, "get", "put"),
            ["/api/usuarios/{id}/deshabilitar"] = Ops("Usuarios", true, "patch"),
            ["/api/equipos"] = Ops("Equipos", true, "get", "post"),
            ["/api/equipos/disponibles"] = Ops("Equipos", true, "get"),
            ["/api/equipos/{id}"] = Ops("Equipos", true, "get", "put"),
            ["/api/prestamos"] = Ops("Préstamos", true, "get", "post"),
            ["/api/prestamos/activos"] = Ops("Préstamos", true, "get"),
            ["/api/prestamos/historial"] = Ops("Préstamos", true, "get"),
            ["/api/prestamos/{id}"] = Ops("Préstamos", true, "get"),
            ["/api/prestamos/{id}/aprobar"] = Ops("Préstamos", true, "patch"),
            ["/api/prestamos/{id}/rechazar"] = Ops("Préstamos", true, "patch"),
            ["/api/prestamos/{id}/cancelar"] = Ops("Préstamos", true, "patch"),
            ["/api/prestamos/{id}/devolucion"] = Ops("Devoluciones", true, "post"),
            ["/api/dashboard"] = Ops("Dashboard", true, "get"),
            ["/api/reportes/equipos-por-estado"] = Ops("Reportes", true, "get"),
            ["/api/reportes/equipos-mas-utilizados"] = Ops("Reportes", true, "get"),
            ["/api/reportes/prestamos-por-area"] = Ops("Reportes", true, "get"),
            ["/api/reportes/movimientos"] = Ops("Reportes", true, "get")
        }
    };

    private static object Ops(string tag, bool secured, params string[] methods)
    {
        var result = new Dictionary<string, object>();
        foreach (var method in methods)
            result[method] = new { tags = new[] { tag }, summary = $"{method.ToUpperInvariant()} {tag}", security = secured ? new[] { new Dictionary<string, string[]> { ["BearerToken"] = [] } } : [], responses = new Dictionary<string, object> { ["200"] = new { description = "Operación correcta" }, ["400"] = new { description = "Solicitud inválida" } } };
        return result;
    }
}

public static class SwaggerPage
{
    public const string Html = """
<!doctype html><html><head><meta charset="utf-8"><title>TechAsset API</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"></head>
<body><div id="swagger-ui"></div><script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({url:'/swagger/v1/swagger.json',dom_id:'#swagger-ui',deepLinking:true,persistAuthorization:true});</script></body></html>
""";
}

