using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TechAsset.Infrastructure.Data;

#nullable disable

namespace TechAsset.Infrastructure.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261107103000_PasswordSecurity")]
public partial class PasswordSecurity : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "DebeCambiarPassword",
            table: "usuarios",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<DateTime>(
            name: "RecuperacionExpiraUtc",
            table: "usuarios",
            type: "timestamp with time zone",
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "RecuperacionTokenHash",
            table: "usuarios",
            type: "character varying(64)",
            maxLength: 64,
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_usuarios_RecuperacionTokenHash",
            table: "usuarios",
            column: "RecuperacionTokenHash");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "IX_usuarios_RecuperacionTokenHash", table: "usuarios");
        migrationBuilder.DropColumn(name: "DebeCambiarPassword", table: "usuarios");
        migrationBuilder.DropColumn(name: "RecuperacionExpiraUtc", table: "usuarios");
        migrationBuilder.DropColumn(name: "RecuperacionTokenHash", table: "usuarios");
    }
}

