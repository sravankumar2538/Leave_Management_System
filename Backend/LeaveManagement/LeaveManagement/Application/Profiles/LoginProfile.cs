namespace LeaveManagement.Application.Profiles;
public class LoginProfile : Profile
{
    public LoginProfile()
    {
        CreateMap<LoginDTO,Employee>().ReverseMap();
    }
}
