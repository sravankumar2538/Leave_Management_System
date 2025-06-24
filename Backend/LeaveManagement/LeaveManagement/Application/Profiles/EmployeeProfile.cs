namespace LeaveManagement.Application.Profiles;
public class EmployeeProfile : Profile
{
    public EmployeeProfile() 
    {
        CreateMap<Employee, EmployeeListResponseDTO>().ReverseMap();
    }
}
