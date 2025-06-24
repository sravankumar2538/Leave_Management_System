using LeaveManagement.shared.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LeaveManagement.Application.DTOs; // Ensure you have this using statement
using LeaveManagement.Application.Interfaces; // Ensure you have this using statement
using LeaveManagement.Application.Services; // Assuming OperationResult is here or a common Shared namespace

namespace LeaveManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportController : ControllerBase
{
    private readonly IReportsService _reportService;

    public ReportController(IReportsService reportService)
    {
        _reportService = reportService;
    }

    /// <summary>
    /// Retrieves the employees report for the current manager.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult{T}"/> containing the employee report details.
    /// Returns 200 OK with the report details if successful, or 404 Not Found if no report is found.
    /// </returns>
    [HttpGet]
    [Authorize(Roles = $"{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<ICollection<ReportResponseDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<ReportResponseDto>>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEmployeeReport()
    {
        var result = await _reportService.GetEmployeeReportAsync();
        if (result.IsSuccess)
        {
            return Ok(result);
        }
        return NotFound(result); // If result is not successful, it means either auth failed or data not found
    }
}