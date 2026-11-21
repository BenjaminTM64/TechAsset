namespace TechAsset.API;

public static class OpenApiDocument
{
    public static object Create() => new
    {
        openapi = "3.0.1",
        info = new
        {
            title = "TechAsset API",
            version = "v1",
            description = "API para la gestión de usuarios, inventario tecnológico, préstamos, devoluciones y reportes de Innovatech."
        },
        servers = new[] { new { url = "http://localhost:5264" } },
        components = new
        {
            securitySchemes = new
            {
                BearerToken = new
                {
                    type = "http",
                    scheme = "bearer",
                    description = "Token devuelto por /api/auth/login (botón Authorize)."
                }
            },
            schemas = Schemas()
        },
        paths = Paths()
    };

    private static Dictionary<string, object> Paths() => new()
    {
        ["/api/auth/login"] = Methods(
            ("post", Op("Iniciar sesión y obtener token", "Autenticación", secured: false, body: "LoginDto"))),
        ["/api/auth/cambiar-password-inicial"] = Methods(
            ("post", Op("Cambiar contraseña inicial", "Autenticación", body: "CambiarPasswordInicialDto"))),
        ["/api/auth/olvide-password"] = Methods(
            ("post", Op("Solicitar recuperación de contraseña", "Autenticación", secured: false, body: "SolicitarRecuperacionDto"))),
        ["/api/auth/restablecer-password"] = Methods(
            ("post", Op("Restablecer contraseña con token", "Autenticación", secured: false, body: "RestablecerPasswordDto"))),

        ["/api/usuarios"] = Methods(
            ("get", Op("Listar usuarios", "Usuarios")),
            ("post", Op("Registrar usuario", "Usuarios", body: "CrearUsuarioDto"))),
        ["/api/usuarios/{id}"] = Methods(
            ("get", Op("Obtener usuario por ID", "Usuarios", pathParam: true)),
            ("put", Op("Actualizar usuario", "Usuarios", body: "ActualizarUsuarioDto", pathParam: true))),
        ["/api/usuarios/{id}/deshabilitar"] = Methods(
            ("patch", Op("Deshabilitar usuario", "Usuarios", pathParam: true))),

        ["/api/equipos"] = Methods(
            ("get", Op("Listar equipos", "Equipos")),
            ("post", Op("Registrar equipo", "Equipos", body: "GuardarEquipoDto"))),
        ["/api/equipos/disponibles"] = Methods(
            ("get", Op("Listar equipos disponibles", "Equipos"))),
        ["/api/equipos/{id}"] = Methods(
            ("get", Op("Obtener equipo por ID", "Equipos", pathParam: true)),
            ("put", Op("Actualizar equipo", "Equipos", body: "GuardarEquipoDto", pathParam: true))),

        ["/api/prestamos"] = Methods(
            ("get", Op("Listar préstamos", "Préstamos")),
            ("post", Op("Registrar solicitud de préstamo", "Préstamos", body: "CrearPrestamoDto"))),
        ["/api/prestamos/activos"] = Methods(
            ("get", Op("Listar préstamos activos", "Préstamos"))),
        ["/api/prestamos/historial"] = Methods(
            ("get", Op("Listar historial de préstamos", "Préstamos"))),
        ["/api/prestamos/{id}"] = Methods(
            ("get", Op("Obtener préstamo por ID", "Préstamos", pathParam: true))),
        ["/api/prestamos/{id}/aprobar"] = Methods(
            ("patch", Op("Aprobar préstamo", "Préstamos", pathParam: true))),
        ["/api/prestamos/{id}/rechazar"] = Methods(
            ("patch", Op("Rechazar préstamo", "Préstamos", body: "RechazarPrestamoDto", pathParam: true))),
        ["/api/prestamos/{id}/cancelar"] = Methods(
            ("patch", Op("Cancelar préstamo", "Préstamos", pathParam: true))),
        ["/api/prestamos/{id}/devolucion"] = Methods(
            ("post", Op("Registrar devolución", "Devoluciones", body: "RegistrarDevolucionDto", pathParam: true))),

        ["/api/dashboard"] = Methods(
            ("get", Op("Obtener indicadores del dashboard", "Dashboard"))),
        ["/api/reportes/equipos-por-estado"] = Methods(
            ("get", Op("Reporte: equipos por estado", "Reportes"))),
        ["/api/reportes/equipos-mas-utilizados"] = Methods(
            ("get", Op("Reporte: equipos más utilizados", "Reportes"))),
        ["/api/reportes/prestamos-por-area"] = Methods(
            ("get", Op("Reporte: préstamos por área", "Reportes"))),
        ["/api/reportes/movimientos"] = Methods(
            ("get", Op("Reporte: movimientos de equipos", "Reportes")))
    };

    private static Dictionary<string, object> Methods(params (string Method, object Operation)[] operations)
    {
        var result = new Dictionary<string, object>();
        foreach (var (method, operation) in operations) result[method] = operation;
        return result;
    }

    private static Dictionary<string, object> Op(
        string summary,
        string tag,
        bool secured = true,
        string? body = null,
        bool pathParam = false)
    {
        var operation = new Dictionary<string, object>
        {
            ["tags"] = new[] { tag },
            ["summary"] = summary,
            ["responses"] = new Dictionary<string, object>
            {
                ["200"] = new { description = "Operación correcta" },
                ["400"] = new { description = "Solicitud inválida" },
                ["401"] = new { description = "No autorizado (falta el token)" }
            }
        };

        if (secured)
            operation["security"] = new object[]
            {
                new Dictionary<string, string[]> { ["BearerToken"] = Array.Empty<string>() }
            };

        if (body is not null)
            operation["requestBody"] = new
            {
                required = true,
                content = new Dictionary<string, object>
                {
                    ["application/json"] = new
                    {
                        schema = new Dictionary<string, string>
                        {
                            ["$ref"] = $"#/components/schemas/{body}"
                        }
                    }
                }
            };

        if (pathParam)
            operation["parameters"] = new object[]
            {
                new
                {
                    name = "id",
                    @in = "path",
                    required = true,
                    description = "Identificador GUID del registro.",
                    schema = new { type = "string", format = "uuid" }
                }
            };

        return operation;
    }

    private static Dictionary<string, object> Schemas() => new()
    {
        ["LoginDto"] = Obj(
            ("correo", "string", "email", "admin@innovatech.com"),
            ("password", "string", "password", "Admin123*")),

        ["CambiarPasswordInicialDto"] = Obj(
            ("nuevaPassword", "string", "password", "Nueva123*"),
            ("confirmarPassword", "string", "password", "Nueva123*")),

        ["SolicitarRecuperacionDto"] = Obj(
            ("correo", "string", "email", "usuario@innovatech.com")),

        ["RestablecerPasswordDto"] = Obj(
            ("token", "string", null, "token-recibido-por-correo"),
            ("nuevaPassword", "string", "password", "Nueva123*"),
            ("confirmarPassword", "string", "password", "Nueva123*")),

        ["CrearUsuarioDto"] = Obj(
            ("nombres", "string", null, "Ana"),
            ("apellidos", "string", null, "Torres"),
            ("area", "string", null, "Sistemas"),
            ("correo", "string", "email", "ana.torres@innovatech.com"),
            ("rol", "string", null, "Colaborador"),
            ("password", "string", "password", "Usuario123*")),

        ["ActualizarUsuarioDto"] = Obj(
            ("nombres", "string", null, "Ana"),
            ("apellidos", "string", null, "Torres"),
            ("area", "string", null, "Sistemas"),
            ("correo", "string", "email", "ana.torres@innovatech.com"),
            ("rol", "string", null, "Colaborador"),
            ("activo", "boolean", null, true)),

        ["GuardarEquipoDto"] = Obj(
            ("codigoPatrimonial", "string", null, "EQ-2026-001"),
            ("nombre", "string", null, "Laptop Dell Latitude 5440"),
            ("categoria", "string", null, "Laptop"),
            ("marca", "string", null, "Dell"),
            ("estado", "string", null, "Disponible")),

        ["CrearPrestamoDto"] = Obj(
            ("fechaPrestamo", "string", "date", "2026-11-21"),
            ("fechaDevolucionProgramada", "string", "date", "2026-11-28"),
            ("motivo", "string", null, "Préstamo para trabajo de campo."),
            ("equipoId", "string", "uuid", "3fa85f64-5717-4562-b3fc-2c963f66afa6")),

        ["RegistrarDevolucionDto"] = Obj(
            ("fechaDevolucion", "string", "date", "2026-11-21"),
            ("observacion", "string", null, "Equipo devuelto en buen estado.")),

        ["RechazarPrestamoDto"] = Obj(
            ("observacion", "string", null, "El equipo no está disponible para esas fechas."))
    };

    private static object Obj(params (string Name, string Type, string? Format, object? Example)[] properties)
    {
        var result = new Dictionary<string, object>();
        var required = new List<string>();

        foreach (var (name, type, format, example) in properties)
        {
            var schema = new Dictionary<string, object> { ["type"] = type };
            if (format is not null) schema["format"] = format;
            if (example is not null) schema["example"] = example;
            result[name] = schema;
            required.Add(name);
        }

        return new { type = "object", required, properties = result };
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
