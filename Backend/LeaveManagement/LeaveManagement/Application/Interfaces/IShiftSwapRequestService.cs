namespace LeaveManagement.Application.Interfaces;

public interface IShiftSwapRequestService
{
    Task<OperationResult<ICollection<ShiftSwapRequestResponseDTO>>> GetAllShiftSwapRequestsByManagerIdAsync();

    Task <OperationResult<string>>ApproveShiftSwapRequestByManagerIdAsync(Guid ShiftSwapRequestId);

    Task<OperationResult<string>> RejectShiftSwapRequestByManagerIdAsync(Guid ShiftSwapRequestId);

    Task<OperationResult<ICollection<ShiftSwapRequestResponseDTO>>> GetShiftSwapStatusByEmployeeIdAsync();

    Task<OperationResult<string>> CancelShiftSwapByEmployeeIdAsync(Guid ShiftRequestId);

    Task<OperationResult<string>> UpdateShiftSwapRequestAsync(Guid ShiftRequestId, UpdateSwapShiftDTO shiftSwapRequest);

    Task<OperationResult<string>> CreateShiftSwapRequestAsync(PostShiftSwapRequestDTO shiftSwapRequest);


}
