
using LeaveManagement.shared.OperationResult;

namespace LeaveManagement.Application.Interfaces;
public interface IShiftsService
{
    Task<OperationResult<ICollection<ShiftsResponseDTO>>> GetAllShiftsByEmployeeIdAsync();
    Task <OperationResult<string>> PostShiftToEmployeeByManagerIdAsync(AssignShiftsDTO shift);
    Task<OperationResult<ICollection<ShiftsResponseDTO>>> GetAllEmployeesShiftsByManagerIdAsync();
    Task<OperationResult<string>> UpdateShiftToEmployeeByManagerIdAsync(UpdateShiftAssignDTO Shift);

}
