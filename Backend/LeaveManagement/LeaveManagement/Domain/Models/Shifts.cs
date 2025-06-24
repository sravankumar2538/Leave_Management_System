namespace LeaveManagement.Domain.Models;

public class Shifts
{
    public Guid ShiftId { get; set; }
    public int EmployeeId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateOnly ShiftDate { get; set; }
    public string ?ShiftTime { get; set; }

    // Navigation property
    public Employee ?Employee { get; set; }

    // Add this navigation property
    public ICollection<ShiftSwapRequest> ShiftSwapRequests { get; set; } = new List<ShiftSwapRequest>();
}

