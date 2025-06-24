namespace LeaveManagement.Application.DTOs;
public class AttendenceResponseDTO
{
    public Guid AttendanceId { get; set; }
    public int EmployeeId { get; set; }
    public DateTime ClockInTime { get; set; }
    public DateTime ClockOutTime { get; set; }
    public double WorkHours { get; set; }
    public DateOnly Date { get; set; }
    public int ClockIn { get; set; }
    public int ClockOut { get; set; }
}
