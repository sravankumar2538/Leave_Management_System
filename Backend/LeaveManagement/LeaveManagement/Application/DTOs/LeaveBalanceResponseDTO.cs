namespace LeaveManagement.Application.DTOs;
public class LeaveBalanceResponseDTO
{
    public int EmployeeId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateOnly Year { get; set; }
    public int Casual { get; set; }
    public int Sick { get; set; }
    public int Vacation { get; set; }
    public int Medical { get; set; }
}
