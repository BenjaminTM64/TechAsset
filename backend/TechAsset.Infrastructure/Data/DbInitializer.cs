using Microsoft.EntityFrameworkCore;
using TechAsset.Domain.Entities;

namespace TechAsset.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();
        var admin = await EnsureUser(db, "11111111-1111-1111-1111-111111111111", "Administrador", "TechAsset", "Tecnología", "admin@innovatech.com", "Administrador", "Admin123*");
        var responsable = await EnsureUser(db, "22222222-2222-2222-2222-222222222222", "Rosa", "Mendoza", "Tecnología", "responsable@innovatech.com", "Responsable de Tecnología", "Responsable123*");
        var colaborador = await EnsureUser(db, "33333333-3333-3333-3333-333333333333", "Carlos", "Ramírez", "Contabilidad", "colaborador@innovatech.com", "Colaborador", "Usuario123*");
        var responsable2 = await EnsureUser(db, "44444444-4444-4444-4444-444444444444", "Luis", "Torres", "Soporte TI", "luis.torres@innovatech.com", "Responsable de Tecnología", "Responsable123*");
        var responsable3 = await EnsureUser(db, "55555555-5555-5555-5555-555555555555", "Diana", "Vega", "Infraestructura", "diana.vega@innovatech.com", "Responsable de Tecnología", "Responsable123*");
        var ana = await EnsureUser(db, "66666666-6666-6666-6666-666666666666", "Ana", "Flores", "Recursos Humanos", "ana.flores@innovatech.com", "Colaborador", "Usuario123*");
        var jorge = await EnsureUser(db, "77777777-7777-7777-7777-777777777777", "Jorge", "Salazar", "Operaciones", "jorge.salazar@innovatech.com", "Colaborador", "Usuario123*");
        var lucia = await EnsureUser(db, "88888888-8888-8888-8888-888888888888", "Lucía", "Paredes", "Marketing", "lucia.paredes@innovatech.com", "Colaborador", "Usuario123*");
        var miguel = await EnsureUser(db, "99999999-9999-9999-9999-999999999999", "Miguel", "Castro", "Finanzas", "miguel.castro@innovatech.com", "Colaborador", "Usuario123*");
        var valeria = await EnsureUser(db, "10101010-1010-1010-1010-101010101010", "Valeria", "Rojas", "Proyectos", "valeria.rojas@innovatech.com", "Colaborador", "Usuario123*");
        _ = await EnsureUser(db, "12121212-1212-1212-1212-121212121212", "Pedro", "Navarro", "Calidad", "pedro.navarro@innovatech.com", "Colaborador", "Usuario123*", activo: false);
        await db.SaveChangesAsync();

        var dell = await EnsureEquipment(db, "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "INV-LAP-001", "Laptop Dell Latitude 5440", "Laptop", "Dell", "Disponible");
        var proyector = await EnsureEquipment(db, "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "INV-PRO-002", "Proyector Epson PowerLite", "Proyector", "Epson", "Disponible");
        _ = await EnsureEquipment(db, "cccccccc-cccc-cccc-cccc-cccccccccccc", "INV-TAB-003", "Tablet Samsung Galaxy Tab", "Tablet", "Samsung", "Mantenimiento");
        var hp = await EnsureEquipment(db, "dddddddd-dddd-dddd-dddd-dddddddddddd", "INV-LAP-004", "Laptop HP EliteBook 840", "Laptop", "HP", "Disponible");
        var lenovo = await EnsureEquipment(db, "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", "INV-LAP-005", "Laptop Lenovo ThinkPad E14", "Laptop", "Lenovo", "Disponible");
        var monitor = await EnsureEquipment(db, "ffffffff-ffff-ffff-ffff-ffffffffffff", "INV-MON-006", "Monitor LG UltraGear 27", "Monitor", "LG", "Disponible");
        var camara = await EnsureEquipment(db, "13131313-1313-1313-1313-131313131313", "INV-CAM-007", "Cámara Logitech Brio", "Cámara", "Logitech", "Disponible");
        _ = await EnsureEquipment(db, "14141414-1414-1414-1414-141414141414", "INV-RED-008", "Router Cisco RV340", "Redes", "Cisco", "Baja");
        var macbook = await EnsureEquipment(db, "15151515-1515-1515-1515-151515151515", "INV-LAP-009", "MacBook Air M2", "Laptop", "Apple", "Disponible");
        var miniPc = await EnsureEquipment(db, "16161616-1616-1616-1616-161616161616", "INV-PC-010", "Mini PC Intel NUC", "Computadora", "Intel", "Disponible");
        var impresora = await EnsureEquipment(db, "17171717-1717-1717-1717-171717171717", "INV-IMP-011", "Impresora HP LaserJet Pro", "Impresora", "HP", "Disponible");
        var acer = await EnsureEquipment(db, "18181818-1818-1818-1818-181818181818", "INV-LAP-012", "Laptop Acer Aspire 5", "Laptop", "Acer", "Disponible");
        await db.SaveChangesAsync();

        var hoy = DateOnly.FromDateTime(DateTime.Today);

        // Solicitudes pendientes para probar aprobación, rechazo y cancelación.
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000001", ana, hp, responsable, hoy.AddDays(1), hoy.AddDays(5), "Capacitación de personal", "Pendiente");
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000002", jorge, monitor, responsable2, hoy.AddDays(2), hoy.AddDays(8), "Supervisión del centro de operaciones", "Pendiente");
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000003", lucia, camara, responsable3, hoy.AddDays(1), hoy.AddDays(4), "Grabación de material institucional", "Pendiente");
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000004", miguel, acer, responsable, hoy.AddDays(3), hoy.AddDays(10), "Presentación de cierre financiero", "Pendiente");

        // Préstamos activos; los equipos correspondientes quedan bloqueados como Prestado.
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000005", colaborador, lenovo, responsable, hoy.AddDays(-3), hoy.AddDays(4), "Auditoría contable trimestral", "Activo");
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000006", ana, macbook, responsable2, hoy.AddDays(-2), hoy.AddDays(5), "Proceso de selección virtual", "Activo");
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000007", jorge, proyector, responsable3, hoy.AddDays(-1), hoy.AddDays(2), "Reunión de planificación operativa", "Activo");

        // Historial para alimentar dashboard, reportes, búsquedas y filtros.
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000008", lucia, dell, responsable, hoy.AddDays(-30), hoy.AddDays(-25), "Campaña de comunicación interna", "Devuelto", hoy.AddDays(-25), "Equipo devuelto completo y sin daños.");
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000009", miguel, miniPc, responsable2, hoy.AddDays(-24), hoy.AddDays(-18), "Procesamiento de información financiera", "Devuelto", hoy.AddDays(-18), "Devolución conforme; accesorios verificados.");
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000010", valeria, impresora, responsable3, hoy.AddDays(-20), hoy.AddDays(-15), "Impresión de expedientes del proyecto", "Devuelto", hoy.AddDays(-15), "Equipo operativo al momento de la entrega.");
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000011", colaborador, dell, responsable, hoy.AddDays(-14), hoy.AddDays(-10), "Revisión de estados contables", "Devuelto", hoy.AddDays(-10), "Laptop entregada con cargador y funda.");
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000012", ana, proyector, responsable2, hoy.AddDays(-12), hoy.AddDays(-8), "Inducción para nuevos colaboradores", "Devuelto", hoy.AddDays(-8), "Proyector devuelto en buen estado.");
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000013", jorge, monitor, responsable3, hoy.AddDays(-9), hoy.AddDays(-5), "Monitoreo de indicadores operativos", "Devuelto", hoy.AddDays(-5), "Monitor y cables entregados correctamente.");
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000014", lucia, camara, responsable, hoy.AddDays(-7), hoy.AddDays(-3), "Cobertura de evento corporativo", "Rechazado", observacion: "El equipo no estaba disponible para la fecha solicitada.");
        await EnsureLoan(db, "20000000-0000-0000-0000-000000000015", valeria, acer, responsable3, hoy.AddDays(-5), hoy.AddDays(1), "Registro audiovisual de avances", "Cancelado", observacion: "Solicitud cancelada por reprogramación de la actividad.");

        await db.SaveChangesAsync();
    }

    private static async Task<Usuario> EnsureUser(AppDbContext db, string id, string nombres, string apellidos, string area, string correo, string rol, string password, bool activo = true)
    {
        var user = await db.Usuarios.FirstOrDefaultAsync(x => x.Correo == correo);
        if (user is null)
        {
            user = new Usuario { Id = Guid.Parse(id), Correo = correo, PasswordHash = BCrypt.Net.BCrypt.HashPassword(password) };
            db.Usuarios.Add(user);
        }
        user.Nombres = nombres;
        user.Apellidos = apellidos;
        user.NombreCompleto = $"{nombres} {apellidos}";
        user.Area = area;
        user.Rol = rol;
        user.Activo = activo;
        return user;
    }

    private static async Task<Equipo> EnsureEquipment(AppDbContext db, string id, string codigo, string nombre, string categoria, string marca, string estado)
    {
        var equipo = await db.Equipos.FirstOrDefaultAsync(x => x.CodigoPatrimonial == codigo);
        if (equipo is not null) return equipo;

        equipo = new Equipo
        {
            Id = Guid.Parse(id),
            CodigoPatrimonial = codigo,
            Nombre = nombre,
            Categoria = categoria,
            Marca = marca,
            Estado = estado
        };
        db.Equipos.Add(equipo);
        return equipo;
    }

    private static async Task EnsureLoan(
        AppDbContext db,
        string id,
        Usuario colaborador,
        Equipo equipo,
        Usuario responsable,
        DateOnly fechaPrestamo,
        DateOnly fechaDevolucionProgramada,
        string motivo,
        string estado,
        DateOnly? fechaDevolucion = null,
        string? observacion = null)
    {
        var prestamoId = Guid.Parse(id);
        if (await db.Prestamos.AnyAsync(x => x.Id == prestamoId)) return;

        var prestamo = new Prestamo
        {
            Id = prestamoId,
            FechaPrestamo = fechaPrestamo,
            FechaDevolucionProgramada = fechaDevolucionProgramada,
            FechaDevolucion = fechaDevolucion,
            Motivo = motivo,
            Observacion = observacion,
            Estado = estado,
            UsuarioId = colaborador.Id,
            EquipoId = equipo.Id,
            ResponsableId = responsable.Id
        };
        db.Prestamos.Add(prestamo);

        var fechaBase = fechaPrestamo.ToDateTime(new TimeOnly(9, 0), DateTimeKind.Utc);
        db.MovimientosEquipo.Add(CreateMovement(prestamo, colaborador, "Solicitud", "Solicitud de préstamo registrada y pendiente de evaluación.", fechaBase));

        if (estado == "Activo")
        {
            equipo.Estado = "Prestado";
            db.MovimientosEquipo.Add(CreateMovement(prestamo, responsable, "Préstamo aprobado", "Equipo asignado al colaborador y marcado como Prestado.", fechaBase.AddHours(2)));
        }
        else if (estado == "Devuelto")
        {
            db.MovimientosEquipo.Add(CreateMovement(prestamo, responsable, "Préstamo aprobado", "Equipo asignado al colaborador y marcado como Prestado.", fechaBase.AddHours(2)));
            db.MovimientosEquipo.Add(CreateMovement(prestamo, responsable, "Devolución", $"Devolución registrada. {observacion}", fechaDevolucion!.Value.ToDateTime(new TimeOnly(16, 30), DateTimeKind.Utc)));
        }
        else if (estado == "Rechazado")
        {
            db.MovimientosEquipo.Add(CreateMovement(prestamo, responsable, "Solicitud rechazada", observacion ?? "Solicitud rechazada durante la evaluación.", fechaBase.AddHours(3)));
        }
        else if (estado == "Cancelado")
        {
            db.MovimientosEquipo.Add(CreateMovement(prestamo, colaborador, "Solicitud cancelada", observacion ?? "El colaborador canceló la solicitud.", fechaBase.AddHours(1)));
        }
    }

    private static MovimientoEquipo CreateMovement(Prestamo prestamo, Usuario usuario, string tipo, string descripcion, DateTime fechaUtc) => new()
    {
        FechaUtc = fechaUtc,
        Tipo = tipo,
        Descripcion = descripcion,
        EquipoId = prestamo.EquipoId,
        PrestamoId = prestamo.Id,
        UsuarioId = usuario.Id
    };
}



