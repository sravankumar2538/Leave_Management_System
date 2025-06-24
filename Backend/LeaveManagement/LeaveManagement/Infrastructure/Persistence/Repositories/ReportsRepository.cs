// File: LeaveManagement.Infrastructure.Persistence.Repositories/ReportsRepository.cs
using Microsoft.EntityFrameworkCore;
using LeaveManagement.Application.Interfaces; // For IReportsRepository
using LeaveManagement.Application.DTOs; // For ReportResponseDto
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LeaveManagement.Infrastructure.Persistence.Repositories;

public class ReportsRepository : IReportsRepository // Implements IReportsRepository
{
    private readonly LeaveDbContext _context;
    // private readonly ITokenService _tokenService; // Remove this if managerId is passed in

    public ReportsRepository(LeaveDbContext context /*, ITokenService tokenService */)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        // _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService)); // Remove this
    }

    public async Task<OperationResult<ICollection<ReportResponseDto>>> GetEmployeeReportAsync(int managerId)
    {
        // Define the date for attendance. Consider passing this as a parameter to the repository method
        // if the absenteeism report needs to be dynamic for different dates.
        var attendanceDate = DateOnly.FromDateTime(DateTime.Now); // Using DateOnly as per your last update

        try
        {
            var totalEmployeeCount = await _context.Employees
                                                   .Where(e => e.ManagerId == managerId)
                                                   .CountAsync();

            var pendingLeaveRequestCount = await _context.LeaveRequests
                                                         .Join(
                                                             _context.Employees,
                                                             leave => leave.EmployeeId,
                                                             employee => employee.EmployeeId,
                                                             (leave, employee) => new { Leave = leave, Employee = employee }
                                                         )
                                                         .Where(joined => joined.Leave.Status == "Pending" && joined.Employee.ManagerId == managerId && joined.Leave.StartDate > DateOnly.FromDateTime(DateTime.Now))
                                                         .CountAsync();

            var pendingShiftSwapRequestsCount = await _context.ShiftSwapRequests
                                                              .Join(
                                                                  _context.Employees,
                                                                  shiftSwap => shiftSwap.EmployeeId,
                                                                  employee => employee.EmployeeId,
                                                                  (shiftSwap, employee) => new { ShiftSwap = shiftSwap, Employee = employee }
                                                              )
                                                              .Where(joined => joined.ShiftSwap.Status == "Pending" && joined.Employee.ManagerId == managerId && joined.ShiftSwap.ShiftDate > DateOnly.FromDateTime(DateTime.Now))
                                                              .CountAsync();

            // Calculate Absent Employees Count
            var presentEmployeesCount = await _context.Attendances
                                                      .Where(a => a.Date == attendanceDate)
                                                      .Join(
                                                          _context.Employees,
                                                          attendance => attendance.EmployeeId,
                                                          employee => employee.EmployeeId,
                                                          (attendance, employee) => new { Attendance = attendance, Employee = employee }
                                                      )
                                                      .Where(joined => joined.Employee.ManagerId == managerId)
                                                      .Select(joined => joined.Employee.EmployeeId)
                                                      .Distinct()
                                                      .CountAsync();

            var absentEmployeesCount = totalEmployeeCount - presentEmployeesCount;

            if (absentEmployeesCount < 0)
            {
                absentEmployeesCount = 0;
            }

            var reportDto = new ReportResponseDto
            {
                TotalEmployees = totalEmployeeCount,
                PendingLeaveRequest = pendingLeaveRequestCount,
                PendingSwapRequest = pendingShiftSwapRequestsCount,
                AbsentEmployees = absentEmployeesCount,
                // AbsenteeismDate = attendanceDate // Add this if you include it in DTO
            };

            return OperationResult<ICollection<ReportResponseDto>>.Success(new List<ReportResponseDto> { reportDto });
        }
        catch (Exception ex)
        {
            // Log the exception using your _logger.LogInformation or other logging mechanism
            // _logger.LogError(ex, "Error getting employee report for managerId: {ManagerId}", managerId);
            return OperationResult<ICollection<ReportResponseDto>>.Failure($"Failed to retrieve report data: {ex.Message}");
        }
    }
}