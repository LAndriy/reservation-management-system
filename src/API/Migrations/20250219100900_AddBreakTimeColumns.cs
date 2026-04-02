using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AllAboutNail.API.Migrations
{
    /// <inheritdoc />
    public partial class AddBreakTimeColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "BreakStart",
                table: "WorkingHours",
                newName: "BreakStartTime");

            migrationBuilder.RenameColumn(
                name: "BreakEnd",
                table: "WorkingHours",
                newName: "BreakEndTime");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "TimeOffs",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "TimeOffs");

            migrationBuilder.RenameColumn(
                name: "BreakStartTime",
                table: "WorkingHours",
                newName: "BreakStart");

            migrationBuilder.RenameColumn(
                name: "BreakEndTime",
                table: "WorkingHours",
                newName: "BreakEnd");
        }
    }
}
