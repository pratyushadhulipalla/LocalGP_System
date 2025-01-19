using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace localgp.Migrations
{
    /// <inheritdoc />
    public partial class CreateAppointmentSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MedicalHistory",
                table: "Patients",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MedicalHistory",
                table: "Patients");
        }
    }
}
