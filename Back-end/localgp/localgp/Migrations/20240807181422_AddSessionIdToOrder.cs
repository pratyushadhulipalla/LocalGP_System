using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace localgp.Migrations
{
    /// <inheritdoc />
    public partial class AddSessionIdToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SessionId",
                table: "Orders",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SessionId",
                table: "Orders");
        }
    }
}
