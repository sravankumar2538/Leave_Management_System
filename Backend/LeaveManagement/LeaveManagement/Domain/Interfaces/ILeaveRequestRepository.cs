namespace LeaveManagement.Domain.Interfaces;

public interface ILeaveRequestRepository
{
    Task<OperationResult<ICollection<LeaveRequest>>> GetEmployeeLeaveRequestStatusByEmployeeIdAsync(int employeeId);
    Task<OperationResult<string>>CancelLeaveRequestBeforeApprovalByEmployeeIdAsync(Guid LeaveId,int employeeId);
    Task<OperationResult<ICollection<LeaveRequest>>> GetEmployeeRequestsByManagerIdAsync(int managerId);
    Task<OperationResult<string>> ApproveLeaveRequestByManagerAsync(Guid LeaveId,int managerId);
    Task<OperationResult<string>> RejectLeaveRequestByManagerAsync(Guid LeaveId,int managerId);
    Task<OperationResult<string>> SubmitLeaveRequestByEmployeeAsync(LeaveRequest leaveRequest);
    Task<OperationResult<string>> UpdateLeaveRequestStatusBeforeApprovalAsync(Guid leaveId, LeaveRequest leaveRequest);



}
