namespace LeaveManagement.Application.DTOs;
public class LeaveRequestStatusResponseDTO
{
    public Guid LeaveId { get; set; }
    public int EmployeeId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public required string LeaveType { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int TotalDays { get; set; }
    public required string Status { get; set; }
    public DateTime TimeStamp { get; set; }
}
