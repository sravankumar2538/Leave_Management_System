namespace LeaveManagement.Application.Interfaces;

public interface IHolidayCalendarService
{
    Task<OperationResult<ICollection<HolidayCalendarResponseDTO>>> GetAnnualHolidayCalenderAsync();
    Task<OperationResult<ICollection<HolidayCalendarResponseDTO>>> UpcomingFiveHolidayCalenderAsync();


}
