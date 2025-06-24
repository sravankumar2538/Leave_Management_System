namespace LeaveManagement.Application.Profiles
{
    public class PostLeaveRequestProfile:Profile
    {
        public PostLeaveRequestProfile()
        {
            CreateMap<LeaveRequest,PostLeaveRequestDTO>().ReverseMap();
        }
    }
}
