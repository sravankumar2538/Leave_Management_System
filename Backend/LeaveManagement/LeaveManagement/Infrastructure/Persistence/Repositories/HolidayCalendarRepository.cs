using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Persistence.Repositories;

public class HolidayCalendarRepository : IHolidayCalendarRepository
{
    private readonly LeaveDbContext _context;

    public HolidayCalendarRepository(LeaveDbContext context)
    {
        _context = context;
    }
    public async Task<OperationResult<ICollection<HolidayCalendar>>> GetAnnualHolidayCalenderAsync()
    {
        // fetching current year
        int year = DateTime.Now.Year;
        // fetching current year public holidays
        var result = await _context.HolidayCalendars.Where(hc => hc.Year == year).ToListAsync();
        if (result == null || result.Count == 0)
        {
            return OperationResult<ICollection<HolidayCalendar>>.Failure("Calendar Not Found");
        }
        // returning result list
        return OperationResult<ICollection<HolidayCalendar>>.Success(result);
    }
    public async Task<OperationResult<ICollection<HolidayCalendar>>> UpcomingFiveHolidayCalenderAsync()
    {
        // fetching current year
        int year = DateTime.Now.Year;
        DateTime today = DateTime.Now;
        // fetching upcoming five public holidays
        var result = await _context.HolidayCalendars
                             .Where(hc => hc.Year == year && hc.Date > DateOnly.FromDateTime(today))
                             .OrderBy(hc => hc.Date)
                             .Take(5)
                             .ToListAsync();
        if(result == null || result.Count == 0)
        {
            return OperationResult<ICollection<HolidayCalendar>>.Failure("Calendar Not Found");
        }
        // returing result list
        return OperationResult<ICollection<HolidayCalendar>>.Success(result);
    }
}
