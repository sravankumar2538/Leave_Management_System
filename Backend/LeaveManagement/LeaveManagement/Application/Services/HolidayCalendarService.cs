
namespace LeaveManagement.Application.Services;
public class HolidayCalendarService : IHolidayCalendarService
{
    private readonly IHolidayCalendarRepository _holidayCalendarRepository;
    private readonly IMapper _mapper;
    private readonly ILogger<HolidayCalendarService> _logger;

    public HolidayCalendarService(IHolidayCalendarRepository holidayCalendarRepository, IMapper mapper, ILogger<HolidayCalendarService> logger)
    {
        _holidayCalendarRepository = holidayCalendarRepository;
        _mapper = mapper;
        _logger = logger;
    }
    public async Task<OperationResult<ICollection<HolidayCalendarResponseDTO>>> GetAnnualHolidayCalenderAsync()
    {
        _logger.LogInformation("GetAnnualHolidayCalenderAsync Service Started at {Time}", DateTime.Now);
        // fetching Annual holidays calendar
        var holidays = await _holidayCalendarRepository.GetAnnualHolidayCalenderAsync();
        if(!holidays.IsSuccess)
        {
            return OperationResult<ICollection<HolidayCalendarResponseDTO>>.Failure(holidays.Message);
        }
        // storing in a list
        var calendar = _mapper.Map<List<HolidayCalendarResponseDTO>>(holidays.Data);
        _logger.LogInformation("GetAnnualHolidayCalenderAsync Service Completed at {Time}", DateTime.Now);
        // returning the calendar list
        return OperationResult<ICollection<HolidayCalendarResponseDTO>>.Success(calendar);
    }
    public async Task<OperationResult<ICollection<HolidayCalendarResponseDTO>>> UpcomingFiveHolidayCalenderAsync()
    {
        _logger.LogInformation("UpcomingFiveHolidayCalenderAsync Service Started at {Time}", DateTime.Now);
        // fetching upcoming five holidays calendar
        var holidays = await _holidayCalendarRepository.UpcomingFiveHolidayCalenderAsync();
        if (!holidays.IsSuccess)
        {
            return OperationResult<ICollection<HolidayCalendarResponseDTO>>.Failure(holidays.Message);
        }
        // storing in a list
        var calendar = new List<HolidayCalendarResponseDTO>();
        calendar = _mapper.Map<List<HolidayCalendarResponseDTO>>(holidays.Data);
        _logger.LogInformation("UpcomingFiveHolidayCalenderAsync Service Completed at {Time}", DateTime.Now);
        // returning the calendar list
        return OperationResult<ICollection<HolidayCalendarResponseDTO>>.Success(calendar);

    }
}
