namespace LeaveManagement.Domain.Models;

public class LeaveRequest
{
    public Guid LeaveId { get; set; }
    public int EmployeeId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string ?LeaveType { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public int TotalDays { get; set; }
    public string ?Status { get; set; }
    public DateTime TimeStamp { get; set; }

    // Navigation property
    public Employee ?Employee { get; set; }
}
