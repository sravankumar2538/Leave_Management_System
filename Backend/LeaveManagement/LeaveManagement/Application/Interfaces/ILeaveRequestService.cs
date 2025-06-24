namespace LeaveManagement.Application.Interfaces;

public interface ILeaveRequestService
{
    Task<OperationResult<ICollection<LeaveRequestStatusResponseDTO>>> GetEmployeeLeaveRequestStatusByEmployeeIdAsync();

    Task<OperationResult<string>> CancelLeaveRequestBeforeApprovalByEmployeeIdAsync(Guid LeaveId);

    Task<OperationResult<ICollection<LeaveRequestStatusResponseDTO>>> GetEmployeeRequestsByManagerIdAsync();

    Task<OperationResult<string>> RejectLeaveRequestByManagerAsync(Guid LeaveId);

    Task<OperationResult<string>> SubmitLeaveRequestByEmployeeAsync(PostLeaveRequestDTO leaveRequest);
    Task<OperationResult<string>> UpdateLeaveRequestStatusBeforeApprovalAsync(Guid leaveId, UpdateLeaveRequestDTO updateLeaveRequest);
    Task<OperationResult<string>> ApproveLeaveRequestByManagerAsync(Guid leaveId);




}
