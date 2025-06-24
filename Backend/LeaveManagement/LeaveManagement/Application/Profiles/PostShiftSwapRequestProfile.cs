namespace LeaveManagement.Application.Profiles;

public class PostShiftSwapRequestProfile : Profile
{
    public PostShiftSwapRequestProfile()
    {
        CreateMap<ShiftSwapRequest, PostShiftSwapRequestDTO>().ReverseMap();
    }
}
