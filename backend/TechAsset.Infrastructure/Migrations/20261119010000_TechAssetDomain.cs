using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TechAsset.Infrastructure.Data;

#nullable disable

namespace TechAsset.Infrastructure.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261119010000_TechAssetDomain")]
public partial class TechAssetDomain : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(name: "Nombres", table: "usuarios", type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: "");
        migrationBuilder.AddColumn<string>(name: "Apellidos", table: "usuarios", type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: "");
        migrationBuilder.AddColumn<string>(name: "Area", table: "usuarios", type: "character varying(100)", maxLength: 100, nullable: false, defaultValue: "");

        migrationBuilder.CreateTable(
            name: "equipos",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                CodigoPatrimonial = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                Nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                Categoria = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                Marca = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                Estado = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_equipos", x => x.Id));

        migrationBuilder.CreateTable(
            name: "prestamos",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                FechaPrestamo = table.Column<DateOnly>(type: "date", nullable: false),
                FechaDevolucionProgramada = table.Column<DateOnly>(type: "date", nullable: false),
                FechaDevolucion = table.Column<DateOnly>(type: "date", nullable: true),
                Motivo = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                Observacion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                Estado = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                UsuarioId = table.Column<Guid>(type: "uuid", nullable: false),
                EquipoId = table.Column<Guid>(type: "uuid", nullable: false),
                ResponsableId = table.Column<Guid>(type: "uuid", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_prestamos", x => x.Id);
                table.ForeignKey("FK_prestamos_equipos_EquipoId", x => x.EquipoId, "equipos", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_prestamos_usuarios_ResponsableId", x => x.ResponsableId, "usuarios", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_prestamos_usuarios_UsuarioId", x => x.UsuarioId, "usuarios", "Id", onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "movimientos_equipo",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                FechaUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                Tipo = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                Descripcion = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                EquipoId = table.Column<Guid>(type: "uuid", nullable: false),
                PrestamoId = table.Column<Guid>(type: "uuid", nullable: true),
                UsuarioId = table.Column<Guid>(type: "uuid", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_movimientos_equipo", x => x.Id);
                table.ForeignKey("FK_movimientos_equipo_equipos_EquipoId", x => x.EquipoId, "equipos", "Id", onDelete: ReferentialAction.Restrict);
                table.ForeignKey("FK_movimientos_equipo_prestamos_PrestamoId", x => x.PrestamoId, "prestamos", "Id", onDelete: ReferentialAction.SetNull);
                table.ForeignKey("FK_movimientos_equipo_usuarios_UsuarioId", x => x.UsuarioId, "usuarios", "Id", onDelete: ReferentialAction.SetNull);
            });

        migrationBuilder.CreateIndex(name: "IX_equipos_CodigoPatrimonial", table: "equipos", column: "CodigoPatrimonial", unique: true);
        migrationBuilder.CreateIndex(name: "IX_prestamos_EquipoId_Estado", table: "prestamos", columns: new[] { "EquipoId", "Estado" });
        migrationBuilder.CreateIndex(name: "IX_prestamos_ResponsableId", table: "prestamos", column: "ResponsableId");
        migrationBuilder.CreateIndex(name: "IX_prestamos_UsuarioId", table: "prestamos", column: "UsuarioId");
        migrationBuilder.CreateIndex(name: "IX_movimientos_equipo_EquipoId", table: "movimientos_equipo", column: "EquipoId");
        migrationBuilder.CreateIndex(name: "IX_movimientos_equipo_PrestamoId", table: "movimientos_equipo", column: "PrestamoId");
        migrationBuilder.CreateIndex(name: "IX_movimientos_equipo_UsuarioId", table: "movimientos_equipo", column: "UsuarioId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("movimientos_equipo");
        migrationBuilder.DropTable("prestamos");
        migrationBuilder.DropTable("equipos");
        migrationBuilder.DropColumn("Nombres", "usuarios");
        migrationBuilder.DropColumn("Apellidos", "usuarios");
        migrationBuilder.DropColumn("Area", "usuarios");
    }
}
