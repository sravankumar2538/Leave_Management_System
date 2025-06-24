namespace LeaveManagement.Domain.Interfaces;

public interface IEmployeeRepository
{
    Task<OperationResult<ICollection<Employee>>> GetAllEmployeeDataByManagerIdAsync(int managerId);
    Task<OperationResult<Employee>> LoginEmployeeToPortalAsync(Employee login);
    Task<OperationResult<ICollection<Employee>>> GetAbsentEmployeesListAsync(int managerId);
    Task<OperationResult<ICollection<Employee>>> GetEmployeeProfileAsync(int employeeId);
    Task<OperationResult<ICollection<Employee>>> GetCurrentDayEmployeesByManagerId(int managerId);
    Task<OperationResult<Employee>> GetEmployeeDetailsByEmail(string email);

   
}
