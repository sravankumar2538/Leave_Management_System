namespace LeaveManagement.Application.DTOs
{
    public class LoginResponseDto
    {
        public bool Success { get; set; }
        public required string Role { get; set; }
        public required string Message { get; set; }
        public required string Token { get; set; }
    }
}
