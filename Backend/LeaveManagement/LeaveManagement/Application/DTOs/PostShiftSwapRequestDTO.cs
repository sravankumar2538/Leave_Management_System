using System.ComponentModel.DataAnnotations;

namespace LeaveManagement.Application.DTOs;

public class PostShiftSwapRequestDTO
{
    [Required(ErrorMessage = "Shift ID required.")]
    public Guid ShiftId { get; set; }

    [Required(ErrorMessage = "Change shift time required.")]
    public required string ChangeShiftTo { get; set; }

    public DateOnly ShiftDate { get; set; }
}