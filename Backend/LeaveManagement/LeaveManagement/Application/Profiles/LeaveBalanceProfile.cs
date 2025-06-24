namespace LeaveManagement.Application.Profiles;

public class LeaveBalanceProfile : Profile
{
    public LeaveBalanceProfile()
    {
        CreateMap<LeaveBalance, LeaveBalanceResponseDTO>().ReverseMap();
    }
}
