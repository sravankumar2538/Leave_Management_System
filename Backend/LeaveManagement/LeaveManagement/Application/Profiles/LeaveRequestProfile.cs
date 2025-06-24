namespace LeaveManagement.Application.Profiles;

public class LeaveRequestProfile : Profile
{
    public LeaveRequestProfile()
    {
        CreateMap<LeaveRequest, LeaveRequestStatusResponseDTO>().ReverseMap();
    }
}
