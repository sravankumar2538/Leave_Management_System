namespace LeaveManagement.Domain.Interfaces;

public interface IShiftsRepository
{
    Task<OperationResult<ICollection<Shifts>>> GetAllShiftsByEmployeeIdAsync(int employeeId);
    Task <OperationResult<string>>PostShiftToEmployeeByManagerIdAsync(Shifts shift, int managerId);
    Task<OperationResult<ICollection<Shifts>>> GetAllEmployeesShiftsByManagerIdAsync(int managerId);
    Task <OperationResult<string>>UpdateShiftToEmployeeByManagerIdAsync(Shifts Shift,int managerId);
}









