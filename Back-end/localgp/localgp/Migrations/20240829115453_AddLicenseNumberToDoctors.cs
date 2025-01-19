using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace localgp.Migrations
{
    /// <inheritdoc />
    public partial class AddLicenseNumberToDoctors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LicenseNumber",
                table: "Doctors",
                nullable: true);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LicenseNumber",
                table: "Doctors");

        }
    }
}
