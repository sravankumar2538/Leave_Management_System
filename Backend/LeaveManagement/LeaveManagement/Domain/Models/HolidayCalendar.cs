namespace LeaveManagement.Domain.Models;

public class HolidayCalendar
{
    public int Year { get; set; }
    public DateOnly Date { get; set; }
    public String? Description { get; set; }
}
