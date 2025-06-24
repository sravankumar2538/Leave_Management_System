namespace LeaveManagement.Domain.Interfaces;

public interface IHolidayCalendarRepository
{
    Task<OperationResult<ICollection<HolidayCalendar>>> GetAnnualHolidayCalenderAsync();
    Task<OperationResult<ICollection<HolidayCalendar>>> UpcomingFiveHolidayCalenderAsync();

}
