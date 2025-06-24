using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaveBalanceController : ControllerBase
{
    private readonly ILeaveBalanceService _leaveBalanceService;
    public LeaveBalanceController(ILeaveBalanceService leaveBalanceService)
    {
        _leaveBalanceService = leaveBalanceService;
    }

    /// <summary>
    /// Retrieves the leave balance of an employee by their ID.
    /// </summary>
    /// <returns>
    /// An <see cref="IActionResult"/> containing the leave balance data.
    /// Returns 200 OK with the leave balance if successful, or 404 Not Found if no leave balance is found.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the leave balance if successful, or 404 Not Found if no leave balance is found.
    /// </remarks>
    [HttpGet("ByEmployeeId")]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<ICollection<LeaveBalanceResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<LeaveBalanceResponseDTO>>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEmpAttendance()
    { 
        var leaveBalance = await _leaveBalanceService.GetLeaveBalanceByEmployeeIdAsync();
        if (leaveBalance != null)
        {
            return Ok(leaveBalance);
        }
        return NotFound(leaveBalance);
    }
}
