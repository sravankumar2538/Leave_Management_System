namespace LeaveManagement.Domain.Interfaces;

public interface IShiftSwapRequestRepository
{
    Task<OperationResult<ICollection<ShiftSwapRequest>>> GetAllShiftSwapRequestsByManagerIdAsync(int managerId);
    Task <OperationResult<string>>ApproveShiftSwapRequestByManagerIdAsync(Guid ShiftRequestId,int managerId);
    Task<OperationResult<string>> RejectShiftSwapRequestByManagerIdAsync(Guid ShiftRequestId,int managerId);
    Task<OperationResult<ICollection<ShiftSwapRequest>>> GetShiftSwapStatusByEmployeeIdAsync(int employeeId);
    Task<OperationResult<string>> CancelShiftSwapByEmployeeIdAsync(Guid ShiftRequestId,int employeeId);
    Task<OperationResult<string>> UpdateShiftSwapRequestAsync(Guid ShiftRequestId,ShiftSwapRequest shiftSwapRequest,int employeeId);

    Task<OperationResult<string>> CreateShiftSwapRequestAsync(int employeeId,ShiftSwapRequest shiftSwapRequest);
}
