using System;
using System.Runtime.Serialization;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace LeaveManagement.Infrastructure.Persistence.Repositories;
public class AttendanceRepository : IAttendanceRepository
{
    private readonly LeaveDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;
    
    public AttendanceRepository(LeaveDbContext context, ITokenService tokenService, IConfiguration configuration)
    {
        _context = context;
        _tokenService = tokenService;
        _configuration = configuration;
    }
    public async Task<OperationResult<ICollection<Attendance>>> GetEmployeeAttendanceByEmployeeIdAsync(int employeeId)
    {
        // fetching current day date
        DateTime currentDate = DateTime.Now;
        // fetching current day - day like 'Monday,tuesday...'
        DayOfWeek currentDay = currentDate.DayOfWeek;
        // calculating days to go back to monday
        int daysToMonday = ((int)currentDay - (int)DayOfWeek.Monday + 7) % 7;
        // getting week start - monday date
        DateTime weekStartDate = currentDate.AddDays(-daysToMonday);
        // getting week end - friday date
        DateTime weekEndDate = weekStartDate.AddDays(4);

        // converting DateTime to DateOnly
        DateOnly weekStartDateOnly = DateOnly.FromDateTime(weekStartDate);
        DateOnly weekEndDateOnly = DateOnly.FromDateTime(weekEndDate);

        // fetching attendance between week start and end date by employeeID
        var result = await _context.Attendances
        .Where(a => a.EmployeeId == employeeId && a.Date >= weekStartDateOnly && a.Date <= weekEndDateOnly)
        .OrderBy(a => a.Date)
        .ToListAsync();
        if(result == null || result.Count == 0)
        {
            return OperationResult<ICollection<Attendance>>.Failure("No Data Found");
        }
        // returing result list
        return OperationResult<ICollection<Attendance>>.Success(result);
    }

    public async Task<OperationResult<ICollection<Attendance>>> GetEmployeeAttendanceInDateRangByEmployeeIdeAsync(int employeeId, DateOnly startDate, DateOnly endDate)
    {
        // fetching Attendance of an Employee in daterange by employeeId
        var result = await _context.Attendances
            .Where(a => a.EmployeeId == employeeId && a.Date >= startDate && a.Date <= endDate)
            .OrderBy(a => a.Date)
            .ToListAsync();
        if (result.Count == 0)
        {
            return OperationResult<ICollection<Attendance>>.Success(result, "No Data Found");
        }
        // returning result list
        return OperationResult<ICollection<Attendance>>.Success(result);
    }

    public async Task<OperationResult<ICollection<Attendance>>> GetEmployeeAttendanceInDateRangeByManagerIdAsync(int managerId, DateOnly startDate, DateOnly endDate)
    {
        // fetching Attendance of an Employee in daterange by managerId
        var result = await _context.Attendances
            .Where(a => a.Employee != null && a.Employee.ManagerId == managerId && a.Date >= startDate && a.Date <= endDate)
            .OrderBy(a => a.Date)
            .ToListAsync();
        if(result == null || result.Count == 0)
        {
            return OperationResult<ICollection<Attendance>>.Failure("No Data Found");
        }
        // returning result list
        return OperationResult<ICollection<Attendance>>.Success(result);
    }
    public async Task<OperationResult<string>> PostClockInByEmployeeIdAsync(int employeeId)
    {
        // fetching current day date
        var currentDate = DateTime.Now.Date;
        // fetching current day - day like 'Monday,tuesday...'
        var currentDayOfWeek = DateTime.Now.DayOfWeek;

        // fetching employee details
        var employee = await _context.Employees
            .Where(e => e.EmployeeId == employeeId)
            .Select(e => new { e.FirstName, e.LastName })
            .FirstOrDefaultAsync();
        if (employee == null)
        {
            return OperationResult<string>.Failure($"Employee with ID {employeeId} not found.");
        }
        // checking the day not equal to saturday and sunday or public holiday
        if (currentDayOfWeek == DayOfWeek.Saturday || currentDayOfWeek == DayOfWeek.Sunday ||
            await _context.HolidayCalendars.AnyAsync(hc => hc.Date == DateOnly.FromDateTime(currentDate)))
        {
            return OperationResult<string>.Failure("Today is a holiday");
        }

        var leaveDays = await _context.LeaveRequests
            .Where(l => l.EmployeeId == employeeId && l.StartDate <= DateOnly.FromDateTime(currentDate) && l.EndDate >= DateOnly.FromDateTime(currentDate) && l.Status == "Approved")
            .FirstOrDefaultAsync();
        if(leaveDays != null)
        {
            return OperationResult<string>.Failure("You are on leave today");
        }

        // listing all public holidays into an array for excluding for attendance
        var existingAttendance = await _context.Attendances
            .Where(a => a.EmployeeId == employeeId && a.Date == DateOnly.FromDateTime(currentDate) && a.ClockIn == 1)
            .Select(a => new { a.AttendanceId, a.ClockInTime })
            .FirstOrDefaultAsync();
        if (existingAttendance != null)
        {
            return OperationResult<string>.Failure("Clock-In Already recorded");
        }
        
        // adding new record
        var attend = new Attendance
        {
            AttendanceId = Guid.NewGuid(),
            EmployeeId = employeeId,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            ClockIn = 1,
            ClockInTime = DateTime.Now,
            ClockOutTime = DateTime.Now, 
            ClockOut = 0,
            Date = DateOnly.FromDateTime(currentDate),
            WorkHours = 0
        };
        _context.Attendances.Add(attend);
        await _context.SaveChangesAsync();
        return OperationResult<string>.Success("Clocked-In Successfully");
    }

    public async Task<OperationResult<string>> PostClockOutByEmployeeIdAsync(int employeeId)
    {

        // fetching current day date
        var currentDate = DateTime.Now.Date;
        var currentDateTime = DateTime.Now;
        // fetching current day - day like 'Monday,tuesday...'
        var currentDayOfWeek = currentDateTime.DayOfWeek;
        // checking the day not equal to saturday and sunday or public holiday
        if (currentDayOfWeek == DayOfWeek.Saturday || currentDayOfWeek == DayOfWeek.Sunday ||
            await _context.HolidayCalendars.AnyAsync(hc => hc.Date == DateOnly.FromDateTime(currentDate)))
        {
            return OperationResult<string>.Failure("Today is a holiday");
        }
        // fetching clockin attendance
        var attendanceToUpdate = await _context.Attendances
            .FirstOrDefaultAsync(a => a.EmployeeId == employeeId &&
                                       a.Date == DateOnly.FromDateTime(currentDate) &&
                                       a.ClockIn == 1 &&
                                       a.ClockOut == 0);
        if (attendanceToUpdate == null)
        {
            bool existingAttendanceToday = await _context.Attendances
                .AnyAsync(a => a.EmployeeId == employeeId && a.Date == DateOnly.FromDateTime(currentDate));
            return OperationResult<string>.Failure(existingAttendanceToday
                ? "Clock-Out Already Marked"
                : "No Attendance Record Found");
        }
        else
        {
            // marking clockout attendance
            attendanceToUpdate.ClockOut = 1;
            attendanceToUpdate.ClockOutTime = currentDateTime;
            TimeSpan timeSpan = attendanceToUpdate.ClockOutTime - attendanceToUpdate.ClockInTime;
            attendanceToUpdate.WorkHours = Math.Round(timeSpan.TotalHours, 2);
            var totalHrsPerDay = _configuration.GetValue<double>("TotalWorkingHours:totalHrsPerDay");
            if (totalHrsPerDay > 0) // Avoid division by zero
            {
                attendanceToUpdate.Percentage = Math.Round((attendanceToUpdate.WorkHours / totalHrsPerDay) * 100, 2);
            }
            else
            {
                attendanceToUpdate.Percentage = 0; // Or handle as an error if totalHrsPerDay is expected to be positive
            }
            _context.Attendances.Update(attendanceToUpdate);
            await _context.SaveChangesAsync();
            return OperationResult<string>.Success("Clock-Out Successfully");
        }
    }
}
