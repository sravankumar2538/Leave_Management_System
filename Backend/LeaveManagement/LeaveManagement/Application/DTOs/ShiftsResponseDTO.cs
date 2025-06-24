namespace LeaveManagement.Application.DTOs;
public class ShiftsResponseDTO
{
    public Guid ShiftId { get; set; }
    public int EmployeeId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }

    public DateOnly ShiftDate { get; set; }
    public required string ShiftTime { get; set; }
    public string? Status { get; set; }
}
