namespace LeaveManagement.Domain.Interfaces;

public interface ILeaveBalanceRepository
{
    Task<LeaveBalance> AddLeaveBalanceForEmployeeAsync(int employeeId, DateOnly yearStartDate);
    Task<OperationResult<ICollection<LeaveBalance>>> GetLeaveBalanceByEmployeeIdAsync(int employeeId);

}
