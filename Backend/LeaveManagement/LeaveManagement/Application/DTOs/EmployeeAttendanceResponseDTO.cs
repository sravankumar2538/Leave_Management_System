namespace LeaveManagement.Application.DTOs;
public class EmployeeAttendanceResponseDTO
{
    public DateOnly Date { get; set; }
    public int EmployeeId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime ClockInTime { get; set; }
    public DateTime ClockOutTime { get; set; }
    public double WorkHours { get; set; } 
    public double Percentage { get; set; }

}
