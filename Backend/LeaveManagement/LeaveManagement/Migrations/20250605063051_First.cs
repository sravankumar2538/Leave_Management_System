using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LeaveManagement.Migrations
{
    /// <inheritdoc />
    public partial class First : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    EmployeeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FirstName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(60)", maxLength: 60, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ManagerId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.EmployeeId);
                    table.ForeignKey(
                        name: "FK_Employees_Employees_ManagerId",
                        column: x => x.ManagerId,
                        principalTable: "Employees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HolidayCalendars",
                columns: table => new
                {
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HolidayCalendars", x => x.Date);
                });

            migrationBuilder.CreateTable(
                name: "LogEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IpAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequestMethod = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    UrlPath = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RequestData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResponseData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StatusCode = table.Column<int>(type: "int", nullable: false),
                    IsSuccess = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LogEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Attendances",
                columns: table => new
                {
                    AttendanceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ClockInTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ClockOutTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    WorkHours = table.Column<double>(type: "float", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    ClockIn = table.Column<int>(type: "int", nullable: false),
                    ClockOut = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Attendances", x => x.AttendanceId);
                    table.ForeignKey(
                        name: "FK_Attendances_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeaveBalances",
                columns: table => new
                {
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Year = table.Column<DateOnly>(type: "date", nullable: false),
                    Casual = table.Column<int>(type: "int", nullable: false),
                    Sick = table.Column<int>(type: "int", nullable: false),
                    Vacation = table.Column<int>(type: "int", nullable: false),
                    Medical = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveBalances", x => x.EmployeeId);
                    table.ForeignKey(
                        name: "FK_LeaveBalances_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeaveRequests",
                columns: table => new
                {
                    LeaveId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LeaveType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    TotalDays = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimeStamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveRequests", x => x.LeaveId);
                    table.ForeignKey(
                        name: "FK_LeaveRequests_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Shifts",
                columns: table => new
                {
                    ShiftId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShiftDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ShiftTime = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shifts", x => x.ShiftId);
                    table.ForeignKey(
                        name: "FK_Shifts_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ShiftSwapRequests",
                columns: table => new
                {
                    ShiftRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ShiftId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ShiftDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ChangeShiftFrom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChangeShiftTo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TimeStamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftSwapRequests", x => x.ShiftRequestId);
                    table.ForeignKey(
                        name: "FK_ShiftSwapRequests_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "EmployeeId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShiftSwapRequests_Shifts_ShiftId",
                        column: x => x.ShiftId,
                        principalTable: "Shifts",
                        principalColumn: "ShiftId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Employees",
                columns: new[] { "EmployeeId", "Email", "FirstName", "LastName", "ManagerId", "Password", "Role" },
                values: new object[,]
                {
                    { 1, "john.doe@example.com", "John", "Doe", null, "$2a$12$Ks6Z3pOlqY2D2YsQnelEa.QcBQ8vO3hfbTrVdJ2hzUAgiITOSiZNG", "Manager" },
                    { 2, "jane.smith@example.com", "Jane", "Smith", null, "$2a$12$x9bx51R8hNIu9QKRxjoc4u.Rnb95i6XopRBvGZKmOh8Gos.MB8diq", "Manager" }
                });

            migrationBuilder.InsertData(
                table: "HolidayCalendars",
                columns: new[] { "Date", "Description", "Year" },
                values: new object[,]
                {
                    { new DateOnly(2025, 1, 1), "New Year's Day", 2025 },
                    { new DateOnly(2025, 1, 14), "Pongal", 2025 },
                    { new DateOnly(2025, 1, 26), "Republic Day", 2025 },
                    { new DateOnly(2025, 3, 21), "Holi", 2025 },
                    { new DateOnly(2025, 4, 14), "Tamil New Year", 2025 },
                    { new DateOnly(2025, 5, 1), "Labour Day", 2025 },
                    { new DateOnly(2025, 8, 15), "Independence Day", 2025 },
                    { new DateOnly(2025, 9, 17), "Ganesh Chaturthi", 2025 },
                    { new DateOnly(2025, 10, 2), "Gandhi Jayanti", 2025 },
                    { new DateOnly(2025, 10, 22), "Dussehra", 2025 },
                    { new DateOnly(2025, 11, 4), "Diwali", 2025 },
                    { new DateOnly(2025, 12, 25), "Christmas", 2025 }
                });

            migrationBuilder.InsertData(
                table: "Employees",
                columns: new[] { "EmployeeId", "Email", "FirstName", "LastName", "ManagerId", "Password", "Role" },
                values: new object[,]
                {
                    { 3, "alice.johnson@example.com", "Alice", "Johnson", 1, "$2a$12$ZcMzFVHN2o8NeHt2kFie9O2XC3ifKvKKiIQID0Q9QF6dWb1XHXWAq", "Developer" },
                    { 4, "bob.brown@example.com", "Bob", "Brown", 1, "$2a$12$Jlvk0ZipMyod0hWbHdwTj.a.LXAoSLHLYK8ks6cqRAP2x9B41QWD2", "DevOps Engineer" },
                    { 5, "charlie.davis@example.com", "Charlie", "Davis", 1, "$2a$12$ocLkjPrgrsxpcZP5lSB9Yu55vjnuB6upLMjc8IE3DmwApPktgxf0q", "Maintenance Engineer" },
                    { 6, "eve.wilson@example.com", "Eve", "Wilson", 2, "$2a$12$eKPVuVVDN.mF6yiJCI7rJ.xygoO2or.bVYmeD3MMiQDu1F5afkjUq", "Developer" },
                    { 7, "alex.jones@example.com", "Alex", "Jones", 2, "$2a$12$YLUO7lCFz8/xsMgFCVR/J.TYXqL.YwYw/IFMXSO/4Ejbp7fRy1bkm", "Tester" },
                    { 8, "maria.lopez@example.com", "Maria", "Lopez", 2, "$2a$12$ymo5uMDo/cUXDDj7yD6qDez5obz.gzuaklWRCHeJB6.Z3hHhWv2sy", "Maintenance Engineer" },
                    { 9, "jack.lol@example.com", "Jack", "Lol", 2, "$2a$12$PpI5NzInKWfO3urdDcWHeO2.JogX5UWZGlC85Dyc7hgx/nE6wnpzG", "DevOps Engineer" },
                    { 10, "elon.mask@example.com", "Elon", "Mask", 2, "$2a$12$iXteU/cK5cKZLYljSTM1We9D5ogfsnuvzxegm8sEA16zOm9vSApNO", "Network Engineer" },
                    { 11, "jan.doe@example.com", "Jan", "Doe", 1, "$2a$10$vqkRzhNjtniw3CCpsoet8uxGXxWanZwek.LrKQCyAQLVvkIOkQJO2", "Tester" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_EmployeeId",
                table: "Attendances",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_ManagerId",
                table: "Employees",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_EmployeeId",
                table: "LeaveRequests",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_EmployeeId",
                table: "Shifts",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftSwapRequests_EmployeeId",
                table: "ShiftSwapRequests",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftSwapRequests_ShiftId",
                table: "ShiftSwapRequests",
                column: "ShiftId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Attendances");

            migrationBuilder.DropTable(
                name: "HolidayCalendars");

            migrationBuilder.DropTable(
                name: "LeaveBalances");

            migrationBuilder.DropTable(
                name: "LeaveRequests");

            migrationBuilder.DropTable(
                name: "LogEntries");

            migrationBuilder.DropTable(
                name: "ShiftSwapRequests");

            migrationBuilder.DropTable(
                name: "Shifts");

            migrationBuilder.DropTable(
                name: "Employees");
        }
    }
}
