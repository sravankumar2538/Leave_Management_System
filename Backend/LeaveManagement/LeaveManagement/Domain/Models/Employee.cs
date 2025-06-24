namespace LeaveManagement.Domain.Models;

public class Employee
{
    public int EmployeeId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }

    public string ?Email { get; set; }
    public string ?Password { get; set; }
    public  string ?Role { get; set; }
    public int? ManagerId { get; set; }


    // Navigation propertiesa
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<LeaveBalance> LeaveBalances { get; set; } = new List<LeaveBalance>();
    public ICollection<Shifts> Shifts { get; set; } = new List<Shifts>();
    public ICollection<ShiftSwapRequest> ShiftSwapRequests { get; set; } = new List<ShiftSwapRequest>();
}
