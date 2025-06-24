namespace LeaveManagement.Application.Profiles;

public class ShiftSwapRequestProfile : Profile
{
    public ShiftSwapRequestProfile()
    {
        CreateMap<ShiftSwapRequest, ShiftSwapRequestResponseDTO>().ReverseMap();
    }
}