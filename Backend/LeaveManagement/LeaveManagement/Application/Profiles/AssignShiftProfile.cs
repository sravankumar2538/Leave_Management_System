namespace LeaveManagement.Application.Profiles;
public class AssignShiftProfile : Profile
{
    public AssignShiftProfile()
    {
        CreateMap<Shifts, AssignShiftsDTO>().ReverseMap();
    }
}
