namespace LeaveManagement.Application.Profiles;

public class AttendanceProfile  : Profile
{
    public AttendanceProfile()
    {
        CreateMap<Attendance, EmployeeAttendanceResponseDTO>().ReverseMap();
    }
}
