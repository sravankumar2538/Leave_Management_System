    using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagement.Controllers;

[ApiController]
[Route("api/[controller]")]

public class ShiftSwapRequestController : ControllerBase
{
    private readonly IShiftSwapRequestService _shiftSwapRequestService;
    public ShiftSwapRequestController(IShiftSwapRequestService shiftSwapRequestService)
    {
        _shiftSwapRequestService = shiftSwapRequestService;
    }

    /// <summary>
    /// Retrieves the shift swap status for an employee by their ID.
    /// </summary>
    /// <returns>
    /// An <see cref="IActionResult"/> containing the result of the retrieval operation.
    /// Returns 200 OK with the result if successful, or 404 Not Found if the retrieval fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 404 Not Found if the retrieval fails.
    /// </remarks>
    [HttpGet("EmployeeStatusByEmployeeId")]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<ICollection<ShiftSwapRequestResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<ShiftSwapRequestResponseDTO>>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> getEmployeeShiftSwapStatus()
    {
        var result = await _shiftSwapRequestService.GetShiftSwapStatusByEmployeeIdAsync();
        if (result.IsSuccess)
        {
            return Ok(result);
        }
        return NotFound(result);
    }

    /// <summary>
    /// Retrieves all shift swap requests for employees managed by a specific manager.
    /// </summary>
    /// <returns>
    /// An <see cref="IActionResult"/> containing the result of the retrieval operation.
    /// Returns 200 OK with the result if successful, or 404 Not Found if the retrieval fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 404 Not Found if the retrieval fails.
    /// </remarks>
    [HttpGet("RequestsByManagerId")]
    [Authorize(Roles = $"{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<ICollection<ShiftSwapRequestResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<ShiftSwapRequestResponseDTO>>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> getEmployeesRequests()
    {
        var result = await _shiftSwapRequestService.GetAllShiftSwapRequestsByManagerIdAsync();
        if (result.IsSuccess)
        {
            return Ok(result);
        }
        return NotFound(result);
    }

    /// <summary>
    /// Approves a shift swap request by it's ID, approved by the manager who manages the employee.
    /// </summary>
    /// <param name="ShiftSwapRequestId">The ID of the shift swap request to approve, provided in the query string.</param>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the result of the approval operation.
    /// Returns 200 OK with the result if successful, or 400 Bad Request if the approval fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 400 Bad Request if the approval fails.
    /// </remarks>
    [HttpPut("ApproveShiftRequest")]
    [Authorize(Roles = $"{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]


    public async Task<ActionResult> ApproveShiftSwapRequest([FromQuery] Guid ShiftSwapRequestId)
    {
        var result = await _shiftSwapRequestService.ApproveShiftSwapRequestByManagerIdAsync(ShiftSwapRequestId);
        if(result.IsSuccess)
        {
            return Ok(result);
        }
        return BadRequest(result);   
    }

    /// <summary>
    /// Rejects a shift swap request by it's ID, rejected by the manager who manages the employee.
    /// </summary>
    /// <param name="ShiftSwapRequestId">The ID of the shift swap request to reject, provided in the query string.</param>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the result of the rejection operation.
    /// Returns 200 OK with the result if successful, or 400 Bad Request if the rejection fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 400 Bad Request if the rejection fails.
    /// </remarks>
    [HttpPut("RejectShiftRequest")]
    [Authorize(Roles = $"{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]

    public async Task<ActionResult> RejectShiftSwapRequest([FromQuery] Guid ShiftSwapRequestId)
    {
        var result = await _shiftSwapRequestService.RejectShiftSwapRequestByManagerIdAsync(ShiftSwapRequestId);
        if(result.IsSuccess)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    /// <summary>
    /// Cancels a shift swap request by the employee, only if the status is pending.
    /// </summary>
    /// <param name="ShiftSwapRequestId">The ID of the shift swap request to cancel, provided in the query string.</param>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the result of the cancellation operation.
    /// Returns 200 OK with the result if successful, or 400 Bad Request if the cancellation fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 400 Bad Request if the cancellation fails.
    /// </remarks>
    [HttpPut("CancelRequestByEmployeeId")]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CancelShiftSwapRequest([FromQuery] Guid ShiftSwapRequestId)
    {
        var result = await _shiftSwapRequestService.CancelShiftSwapByEmployeeIdAsync(ShiftSwapRequestId);
        if(result.IsSuccess)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }


    /// <summary>
    /// Updates a shift swap request details by the employee, only if the status is pending.
    /// </summary>
    /// <param name="ShiftSwapRequestId">The ID of the shift swap request to update, provided in the query string.</param>
    /// <param name="shiftSwapRequest">The updated shift swap request details provided in the request body.</param>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the result of the update operation.
    /// Returns 200 OK with the result if successful, or 400 Bad Request if the update fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 400 Bad Request if the update fails.
    /// </remarks>
    [HttpPut("ByEmployeeId")]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> UpdateShiftSwapRequest([FromQuery] Guid ShiftSwapRequestId, [FromBody] UpdateSwapShiftDTO shiftSwapRequest)
    {
        var result = await _shiftSwapRequestService.UpdateShiftSwapRequestAsync(ShiftSwapRequestId, shiftSwapRequest);
        if(result.IsSuccess)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    /// <summary>
    /// Submits a shift swap request by an employee.
    /// </summary>
    /// <returns>
    /// An <see cref="IActionResult"/> containing the result of the creation operation.
    /// Returns 200 OK with the result if successful, or 400 Bad Request if the creation fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 400 Bad Request if the creation fails.
    /// </remarks>

    [HttpPost("ByEmployeeId")]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PostShiftSwapRequest([FromBody] PostShiftSwapRequestDTO shiftSwapRequest)
    {
        var result = await _shiftSwapRequestService.CreateShiftSwapRequestAsync(shiftSwapRequest);
        if(result.IsSuccess)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }
}
