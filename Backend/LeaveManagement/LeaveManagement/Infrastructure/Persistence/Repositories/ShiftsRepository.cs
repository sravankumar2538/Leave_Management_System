using LeaveManagement.Domain.Models;
using LeaveManagement.shared.OperationResult;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Metrics;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace LeaveManagement.Infrastructure.Persistence.Repositories;

public class ShiftsRepository : IShiftsRepository
{
    private readonly LeaveDbContext _context;
    public ShiftsRepository(LeaveDbContext context)
    {
        _context = context;
    }
    public async Task<OperationResult<ICollection<Shifts>>> GetAllEmployeesShiftsByManagerIdAsync(int managerId)
    {
        // fetching current date
        DateOnly today = DateOnly.FromDateTime(DateTime.Now);
        // fetching employees assigned shifts by manager  
        var result = await _context.Shifts
         .Include(s => s.Employee)
         .Where(s => s.Employee != null && s.Employee.ManagerId == managerId && s.ShiftDate >= today)
         .OrderBy(s => s.ShiftDate)
         .ToListAsync();
        if(result == null || result.Count == 0)
        {
            return OperationResult<ICollection<Shifts>>.Failure("No Data Found");
        }
        // returning result list
        return OperationResult<ICollection<Shifts>>.Success(result);
    }
    public async Task<OperationResult<ICollection<Shifts>>> GetAllShiftsByEmployeeIdAsync(int employeeId)
    {
        DateOnly today = DateOnly.FromDateTime(DateTime.Now);

        // Fetch Shifts entities.
        // Eagerly load ShiftSwapRequests and Employee using .Include()
        var result = await _context.Shifts
            .Where(s => s.EmployeeId == employeeId && s.ShiftDate >= today)
            .Include(s => s.Employee) // Include Employee to populate FirstName/LastName if needed from Employee entity
            .Include(s => s.ShiftSwapRequests) // Crucial: Include swap requests for mapping status in service
                .ThenInclude(ssr => ssr.Employee) // If ShiftSwapRequest.Employee is also needed, include it
            .OrderBy(s => s.ShiftDate)
            .ToListAsync();

        if (result == null || result.Count == 0)
        {
            return OperationResult<ICollection<Shifts>>.Failure("No shifts found for this employee starting from today.");
        }

        // Return raw Shifts entities
        return OperationResult<ICollection<Shifts>>.Success(result);
    }
    public async Task<OperationResult<string>> PostShiftToEmployeeByManagerIdAsync(Shifts shiftTemplate, int managerId)
    {
        // fetching employees under manager
        var employee = await _context.Employees
            .Where(e => e.EmployeeId == shiftTemplate.EmployeeId && e.ManagerId == managerId)
            .Select(e => new { e.EmployeeId, e.FirstName, e.LastName })
            .FirstOrDefaultAsync();
        if (employee == null)
        {
            return OperationResult<string>.Failure("Employee not found under manager");
        }
        // fetch current day date
        DateTime today = DateTime.Now;
        // checking shift date valid or not
        if (shiftTemplate.ShiftDate < DateOnly.FromDateTime(today))
        {
            return OperationResult<string>.Failure("Cannot assign shift to a past date");
        }
        // checking dates already assigned or not
        var isShiftAlreadyAssignedForDate = await _context.Shifts
            .AnyAsync(c => c.ShiftDate == shiftTemplate.ShiftDate && c.EmployeeId == employee.EmployeeId);
        if (isShiftAlreadyAssignedForDate)
        {
            return OperationResult<string>.Failure("Shift Already Assigned for this date");
        }
        // Assigning 5 days same shifts by manager of an employee
        var shiftsToAssign = new List<Shifts>();
        var currentDate = shiftTemplate.ShiftDate;
        int shiftsAssignedCount = 0;
        while (shiftsAssignedCount < 5)
        {
            var shiftDayOfWeek = currentDate.DayOfWeek;
            bool isWorkingDayAndNotHoliday = shiftDayOfWeek != DayOfWeek.Saturday && shiftDayOfWeek != DayOfWeek.Sunday &&
                                             !await _context.HolidayCalendars.AnyAsync(hc => hc.Date == currentDate);
            if (isWorkingDayAndNotHoliday)
            {
                bool existingShiftForEmployee = await _context.Shifts.AnyAsync(s =>
                    s.EmployeeId == shiftTemplate.EmployeeId &&
                    s.ShiftDate == currentDate);

                if (!existingShiftForEmployee)
                {
                    shiftsToAssign.Add(new Shifts
                    {
                        ShiftId = Guid.NewGuid(),
                        EmployeeId = shiftTemplate.EmployeeId,
                        FirstName = employee.FirstName,
                        LastName = employee.LastName,
                        ShiftDate = currentDate,
                        ShiftTime = shiftTemplate.ShiftTime
                    });
                    shiftsAssignedCount++;
                }
            }
            currentDate = currentDate.AddDays(1);
        }
        if (shiftsToAssign.Any())
        {
            _context.Shifts.AddRange(shiftsToAssign);
            await _context.SaveChangesAsync();
            return OperationResult<string>.Success($"{shiftsToAssign.Count} shifts assigned successfully");
        }
        else
        {
            return OperationResult<string>.Success("No shifts were assigned");
        }
    }

    public async Task<OperationResult<string>> UpdateShiftToEmployeeByManagerIdAsync(Shifts Shift, int managerId)
    {
        // fetching shift of an employee
        var fetchShift = await _context.Shifts.FindAsync(Shift.ShiftId);
        if (fetchShift == null)
        {
            return OperationResult<string>.Failure("Shift not found");
        }
        if(Shift.ShiftDate == DateOnly.FromDateTime(DateTime.Now))
        {
            return OperationResult<string>.Failure("Cannot Update Today's Shift");
        }
        // checking employee and manager relationship
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeId == fetchShift.EmployeeId && e.ManagerId == managerId);
        if (employee == null)
        {
            return OperationResult<string>.Failure("Employee not found under this manager");
        }
        // checking updated data changed or not compare with previous
        if (fetchShift.ShiftTime == Shift.ShiftTime)
        {
            return OperationResult<string>.Failure("Shift time unchanged");
        }
        // updating shift by manager
        fetchShift.ShiftTime = Shift.ShiftTime;
        _context.Shifts.Update(fetchShift);
        await _context.SaveChangesAsync();
        return OperationResult<string>.Success("Shift updated successfully");
    }
}
