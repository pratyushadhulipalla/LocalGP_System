using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace localgp.Migrations
{
    /// <inheritdoc />
    public partial class CreateDateupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "Date",
                table: "DoctorAvailabilities",
                type: "date",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Date",
                table: "DoctorAvailabilities");
        }
    }
}
