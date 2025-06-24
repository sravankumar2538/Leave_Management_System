using System.ComponentModel.DataAnnotations;

namespace LeaveManagement.Application.DTOs;

public class AssignShiftsDTO
{
    [Required(ErrorMessage = "Employee ID is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Employee ID must be a positive number")]
    public int EmployeeId { get; set; }

    [Required(ErrorMessage = "Shift Date is required.")]
    public DateOnly ShiftDate { get; set; }

    [Required(ErrorMessage = "Shift Time is required.")]
    public required string ShiftTime { get; set; }
}