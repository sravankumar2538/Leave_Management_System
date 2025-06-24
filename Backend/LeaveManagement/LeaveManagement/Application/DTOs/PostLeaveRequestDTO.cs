using System.ComponentModel.DataAnnotations;

namespace LeaveManagement.Application.DTOs;

public class PostLeaveRequestDTO 
{
    [Required(ErrorMessage = "Leave type required.")]
    public required string LeaveType { get; set; }

    [Required(ErrorMessage = "Start date required.")]
    public DateOnly StartDate { get; set; }

    [Required(ErrorMessage = "End date required.")]
    public DateOnly EndDate { get; set; }

}