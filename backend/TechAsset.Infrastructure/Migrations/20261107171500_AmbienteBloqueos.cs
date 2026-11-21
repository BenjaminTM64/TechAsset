using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using TechAsset.Infrastructure.Data;

#nullable disable

namespace TechAsset.Infrastructure.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20261107171500_AmbienteBloqueos")]
public partial class AmbienteBloqueos : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateOnly>(
            name: "BloqueoDesde",
            table: "ambientes",
            type: "date",
            nullable: true);

        migrationBuilder.AddColumn<DateOnly>(
            name: "BloqueoHasta",
            table: "ambientes",
            type: "date",
            nullable: true);

        migrationBuilder.AddColumn<bool>(
            name: "BloqueoIndefinido",
            table: "ambientes",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "ObservacionEstado",
            table: "reservas",
            type: "character varying(300)",
            maxLength: 300,
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "BloqueoDesde", table: "ambientes");
        migrationBuilder.DropColumn(name: "BloqueoHasta", table: "ambientes");
        migrationBuilder.DropColumn(name: "BloqueoIndefinido", table: "ambientes");
        migrationBuilder.DropColumn(name: "ObservacionEstado", table: "reservas");
    }
}

