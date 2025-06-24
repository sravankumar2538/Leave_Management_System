namespace LeaveManagement.Application.Profiles;

public class UpdateShiftAssignProfile : Profile
{
    public UpdateShiftAssignProfile()
    {
        CreateMap<Shifts, UpdateShiftAssignDTO>().ReverseMap();
    }
}
