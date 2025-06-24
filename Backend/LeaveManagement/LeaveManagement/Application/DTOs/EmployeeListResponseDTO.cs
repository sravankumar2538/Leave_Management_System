using System.ComponentModel.DataAnnotations;

namespace LeaveManagement.Application.DTOs;

public class EmployeeListResponseDTO
{
    public int EmployeeId { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    [Required(ErrorMessage ="Please Enter Role")]
    public required string Role { get; set; }
    public int ManagerId { get; set; }

}
