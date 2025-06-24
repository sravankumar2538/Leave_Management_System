using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagement.Controllers;

[ApiController]
[Route("api/[controller]")]

public class ShiftsController : ControllerBase
{
    private readonly IShiftsService _shiftsService;
    public ShiftsController(IShiftsService shiftsService)
    {
        _shiftsService = shiftsService;
    }

    /// <summary>
    /// Retrieves all shifts for an employee by their ID.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the result of the retrieval operation.
    /// Returns 200 OK with the result if successful, or 404 Not Found if the employee or shifts are not found.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 404 Not Found if the employee or shifts are not found.
    /// </remarks>
    [HttpGet("ByEmployeeId")]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<ICollection<ShiftsResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<ShiftsResponseDTO>>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetEmployeeByEmpId()
    {
        var employee = await _shiftsService.GetAllShiftsByEmployeeIdAsync();
        if (employee.IsSuccess)
        {
            return Ok(employee);
        }
        return NotFound(employee);
    }

    /// <summary>
    /// Retrieves all shifts for employees managed by a specific manager.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the result of the retrieval operation.
    /// Returns 200 OK with the result if successful, or 404 Not Found if no employees or shifts are found.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 404 Not Found if no employees or shifts are found.
    /// </remarks>
    [HttpGet("AllEmployeesByManagerId")]
    [Authorize(Roles = $"{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<ICollection<ShiftsResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<ShiftsResponseDTO>>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetEmployeeByManagerId()
    {
        var employee = await _shiftsService.GetAllEmployeesShiftsByManagerIdAsync();
        if (employee.IsSuccess)
        {
            return Ok(employee);
        }
        return NotFound(employee);
    }

    /// <summary>
    /// Assigns shifts to an employee by the manager.
    /// </summary>
    /// <param name="shift">The shift details provided in the request body.</param>
    /// <returns>
    /// An <see cref="IActionResult"/> containing the result of the assignment operation.
    /// Returns 200 OK with the result if successful, or 400 Bad Request if the assignment fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 400 Bad Request if the assignment fails.
    /// </remarks>
    [HttpPost("AssignShifts")]
    [Authorize(Roles = $"{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PostShiftToEmployeeByManagerId([FromBody] AssignShiftsDTO shift)
    {
        var result = await _shiftsService.PostShiftToEmployeeByManagerIdAsync(shift);
        if(result.IsSuccess)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    /// <summary>
    /// Updates the assigned shifts for an employee by the manager.
    /// </summary>
    /// <param name="shift">The updated shift details provided in the request body.</param>
    /// <returns>
    /// An <see cref="IActionResult"/> containing the result of the update operation.
    /// Returns 200 OK with the result if successful, or 400 Bad Request if the update fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 400 Bad Request if the update fails.
    /// </remarks>
    [HttpPut("AssignShifts")]
    [Authorize(Roles = $"{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateShiftToEmployeeByManagerId([FromBody] UpdateShiftAssignDTO shift)
    {
        var result = await _shiftsService.UpdateShiftToEmployeeByManagerIdAsync(shift);
        if(result.IsSuccess)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }
}
