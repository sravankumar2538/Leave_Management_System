namespace LeaveManagement.Domain.Models;

public class Attendance
{
    public Guid AttendanceId { get; set; } 
    public int EmployeeId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime ClockInTime { get; set; }
    public DateTime ClockOutTime { get; set; }
    public double WorkHours { get; set; }
    public DateOnly Date { get; set; }
    public double Percentage { get; set; }
    public int ClockIn { get; set; }
    public int ClockOut { get; set; }

    // Navigation property
    public Employee? Employee { get; set; }
}
