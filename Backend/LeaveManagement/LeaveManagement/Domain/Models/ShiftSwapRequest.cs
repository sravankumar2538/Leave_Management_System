namespace LeaveManagement.Domain.Models;

public class ShiftSwapRequest
{
    public Guid ShiftRequestId { get; set; }
    public Guid ShiftId { get; set; }
    public int EmployeeId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateOnly ShiftDate { get; set; }
    public string ?ChangeShiftFrom { get; set; }
    public string ?ChangeShiftTo { get; set; }
    public string ?Status { get; set; }
    public DateTime TimeStamp { get; set; }

    // Navigation properties
    public Shifts ?Shift { get; set; }
    public Employee ?Employee { get; set; }
}
