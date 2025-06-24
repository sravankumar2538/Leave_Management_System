namespace LeaveManagement.Application.Profiles;

public class HolidayCalenderProfile : Profile
{
    public HolidayCalenderProfile()
    {
        CreateMap<HolidayCalendar, HolidayCalendarResponseDTO>().ReverseMap();
    }
}

