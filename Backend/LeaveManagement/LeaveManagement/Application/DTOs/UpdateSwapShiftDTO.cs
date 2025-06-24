using System.ComponentModel.DataAnnotations;

namespace LeaveManagement.Application.DTOs;

public class UpdateSwapShiftDTO
{
    [Required(ErrorMessage = "Change shift time required.")]
    public required string ChangeShiftTo { get; set; }
    public DateOnly ShiftDate { get; set; }

}