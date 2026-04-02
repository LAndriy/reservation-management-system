using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AllAboutNail.API.Migrations
{
    /// <inheritdoc />
    public partial class AddServicesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DurationInMinutes = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "cdd40f52-a082-4a08-9fee-c098a2005a4e");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "270238e5-1f8e-46d8-a04c-5ab452de9f50");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "9388233c-561b-4d39-9341-76da476bc0f6");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "233b36d9-3298-4913-b0ec-fe81537c3e69", "AQAAAAIAAYagAAAAEHscoXyMX0+CFR9UIDVPzlg4yfEfC6aILk2M6Nn0pLQJvvQ7WulmQHVi34LcdjDkOQ==", "dc74d85c-dad7-4d5d-ba43-5d9273186f37" });

            migrationBuilder.InsertData(
                table: "Services",
                columns: new[] { "Id", "Description", "DurationInMinutes", "Name", "Price" },
                values: new object[,]
                {
                    { 1, "Tradycyjny manicure z malowaniem paznokci", 45, "Manicure klasyczny", 60.00m },
                    { 2, "Manicure z użyciem lakieru hybrydowego", 60, "Manicure hybrydowy", 90.00m },
                    { 3, "Pełny zabieg pedicure", 60, "Pedicure", 100.00m }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Services");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 1,
                column: "ConcurrencyStamp",
                value: "e243295f-ffae-4be3-9467-cd87cd4b804b");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 2,
                column: "ConcurrencyStamp",
                value: "b2539218-140a-47a5-84bc-25500dd7b6d9");

            migrationBuilder.UpdateData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: 3,
                column: "ConcurrencyStamp",
                value: "fe00379e-6007-405a-8af4-65b3a34fd7ff");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "986be036-c2b6-40b6-9ae8-9f8712774718", "AQAAAAIAAYagAAAAEOn9aeiOmaJVwvJlse64vGLse3uqrHwgWDy/bQlHBWJySxLTMpNL+XQ8P9SbxMZr6w==", "d3856f6f-ee0e-49b2-a4a5-293c7558d19d" });
        }
    }
}
