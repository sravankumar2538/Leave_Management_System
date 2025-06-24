namespace LeaveManagement.Application.DTOs;
public class ShiftSwapRequestResponseDTO
{
    public Guid ShiftRequestId { get; set; }
    public Guid ShiftId { get; set; }
    public int EmployeeId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }

    public DateOnly ShiftDate { get; set; }
    public required string ChangeShiftFrom { get; set; }
    public required string ChangeShiftTo { get; set; }
    public required string Status { get; set; }
    public DateTime TimeStamp { get; set; }

}
