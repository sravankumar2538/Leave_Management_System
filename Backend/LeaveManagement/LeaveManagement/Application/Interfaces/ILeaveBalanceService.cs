namespace LeaveManagement.Application.Interfaces;

public interface ILeaveBalanceService
{
    Task<OperationResult<ICollection<LeaveBalanceResponseDTO>>> GetLeaveBalanceByEmployeeIdAsync(); 
}
