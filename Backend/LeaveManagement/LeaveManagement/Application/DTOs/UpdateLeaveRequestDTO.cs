using System.ComponentModel.DataAnnotations;

namespace LeaveManagement.Application.DTOs;

public class UpdateLeaveRequestDTO : IValidatableObject
{
    [Required(ErrorMessage = "Leave type required.")]
    public required string LeaveType { get; set; }

    [Required(ErrorMessage = "Start date required.")]
    public DateOnly StartDate { get; set; }

    [Required(ErrorMessage = "End date required.")]
    public DateOnly EndDate { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (EndDate < StartDate)
        {
            yield return new ValidationResult(
                "End date cannot be before start date.",
                new[] { nameof(EndDate) });
        }
    }
}