using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace localgp.Migrations
{
    /// <inheritdoc />
    public partial class Addappointmentmode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Mode",
                table: "Appointments",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OnlineMeetingLink",
                table: "Appointments",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Mode",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "OnlineMeetingLink",
                table: "Appointments");
        }
    }
}
