using LeaveManagement.Domain.Models;
using LeaveManagement.shared.OperationResult;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
namespace LeaveManagement.Infrastructure.Persistence.Repositories;


public class EmployeeRepository : IEmployeeRepository
{
    private readonly LeaveDbContext _context;
    public EmployeeRepository(LeaveDbContext context) 
    { 
        _context = context;
    }
    public async Task<OperationResult<ICollection<Employee>>> GetAllEmployeeDataByManagerIdAsync(int managerId)
    {
        // fetching employee data by manager
        var result = await _context.Employees.Where(e => e.ManagerId == managerId).ToListAsync();
        if(result == null || result.Count == 0)
        {
            return OperationResult<ICollection<Employee>>.Failure("No Data Found");
        }
        // returning result list
        return OperationResult<ICollection<Employee>>.Success(result);
    }

    public async Task<OperationResult<ICollection<Employee>>> GetCurrentDayEmployeesByManagerId(int managerId)
    {
        // fetching current day date
        DateOnly today = DateOnly.FromDateTime(DateTime.Today);
        // fetching current day emoloyees who marked clockin attendance
        var employees = await _context.Employees
            .Where(e => e.ManagerId == managerId)
            .Join(_context.Attendances.Where(a => a.Date == today),
                  e => e.EmployeeId,
                  a => a.EmployeeId,
                  (e, a) => new Employee
                  {
                      EmployeeId = e.EmployeeId,
                      FirstName = e.FirstName,
                      LastName = e.LastName,
                      Email = e.Email,
                      Role = e.Role
                  })
            .ToListAsync();
        if (employees == null || employees.Count == 0)
        {
            return OperationResult<ICollection<Employee>>.Failure("No Data Found");
        }
        // returing result list
        return OperationResult<ICollection<Employee>>.Success(employees);
    }

    public async Task<OperationResult<ICollection<Employee>>> GetEmployeeProfileAsync(int employeeId)
    {
        // fetching employee profile data
        var result = await _context.Employees.Where(e => e.EmployeeId == employeeId).ToListAsync();
        if (result == null)
        {
            return OperationResult<ICollection<Employee>>.Failure("No Data Found");
        }
        // returing result list
        return OperationResult<ICollection<Employee>>.Success(result);
    }

    public  Task<OperationResult<Employee>> LoginEmployeeToPortalAsync(Employee loginRequest)
    {
        throw new NotImplementedException();

    }
    
    public async Task<OperationResult<Employee>> GetEmployeeDetailsByEmail(string email)
    {
        var user = await _context.Employees.FirstOrDefaultAsync(e => e.Email == email);

        if (user == null) // If no user is found
        {
            // Log information about the failure
            return OperationResult<Employee>.Failure("No Employee Found with the provided email."); // Corrected type and message
        }
        else // If a user is found
        {
            // Log information about the success
            return OperationResult<Employee>.Success(user); // Corrected to Success and passed the user object
        }
    }

    public async Task<OperationResult<ICollection<Employee>>> GetAbsentEmployeesListAsync(int managerId)
    {
        try
        {
            // Get today's date as DateOnly for accurate comparison
            var today = DateOnly.FromDateTime(DateTime.Now);

            var absentEmployees = await _context.Employees
             .Where(e => e.ManagerId == managerId &&
                         !_context.Attendances.Any(a => a.EmployeeId == e.EmployeeId &&
                                                        a.Date == today)) // This part is the NOT IN equivalent
             .ToListAsync();


            return OperationResult<ICollection<Employee>>.Success(absentEmployees);
        }
        catch (Exception)
        {
            // Remembered: using _logger.LogInformation
            return OperationResult<ICollection<Employee>>.Failure("Failed to retrieve absent employees.");
        }
    }
}
