namespace LeaveManagement.Application.Profiles;

public class UpdateSwapShiftProfile : Profile
{
    public UpdateSwapShiftProfile()
    {
        CreateMap<ShiftSwapRequest, UpdateSwapShiftDTO>().ReverseMap();
    }
}
