using System.ComponentModel.DataAnnotations;

namespace LeaveManagement.Application.DTOs;

public class UpdateShiftAssignDTO
{
    [Required(ErrorMessage = "Shift ID required.")]
    public Guid ShiftId { get; set; }

    [Required(ErrorMessage = "Shift time required.")]
    public required string ShiftTime { get; set; }
    public required DateOnly ShiftDate { get; set; }
}