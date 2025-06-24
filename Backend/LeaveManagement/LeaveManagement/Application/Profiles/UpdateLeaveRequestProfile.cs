namespace LeaveManagement.Application.Profiles;

public class UpdateLeaveRequestProfile : Profile
{
    public UpdateLeaveRequestProfile() 
    {
        CreateMap<LeaveRequest, UpdateLeaveRequestDTO>().ReverseMap();
    }
}
