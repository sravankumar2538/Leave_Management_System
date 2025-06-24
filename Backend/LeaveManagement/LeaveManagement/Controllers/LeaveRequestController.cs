using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaveRequestController : ControllerBase
{
    private readonly ILeaveRequestService _leaveRequestService;
    public LeaveRequestController(ILeaveRequestService leaveRequestService)
    {
        _leaveRequestService = leaveRequestService;
    }

    /// <summary>
    /// Retrieves the leave request status of an employee by their ID.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the leave request status.
    /// Returns 200 OK with the status if successful, or 404 Not Found if no status is found.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the leave request status if successful, or 404 Not Found if no status is found.
    /// </remarks>
    [HttpGet("EmployeeStatus")]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<ICollection<LeaveRequestStatusResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<LeaveRequestStatusResponseDTO>>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetEmployeeByEmpId()
    {
        var employee = await _leaveRequestService.GetEmployeeLeaveRequestStatusByEmployeeIdAsync();
        if (employee.IsSuccess)
        {
            return Ok(employee);
        }
        return NotFound(employee);
    }


    /// <summary>
    /// Retrieves the pending leave requests of employees managed by a specific manager.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the leave request data.
    /// Returns 200 OK with the leave request data if successful, or 404 Not Found if no requests are found.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the leave request data if successful, or 404 Not Found if no requests are found.
    /// </remarks>
    [HttpGet("PendingRequestsByManager")]
    [Authorize(Roles = $"{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<ICollection<LeaveRequestStatusResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<LeaveRequestStatusResponseDTO>>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetEmployeeByManagerId()
    {
        var employee = await _leaveRequestService.GetEmployeeRequestsByManagerIdAsync();
        if (employee.IsSuccess)
        {
            return Ok(employee);
        }
        return NotFound(employee);
    }

    /// <summary>
    /// Approves a leave request by its ID, approved by the manager who manages the employee.    
    /// </summary>
    /// <param name="LeaveId">The ID of the leave request to approve.</param>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the result of the approval operation.
    /// Returns 200 OK with the result if successful, or 400 Bad Request if the approval fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 400 Bad Request if the approval fails.
    /// </remarks>
    [HttpPut("ApproveLeave")]
    [Authorize(Roles = $"{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]

    public async Task<ActionResult> ApproveLeave([FromQuery]Guid LeaveId)
    {
        var result = await _leaveRequestService.ApproveLeaveRequestByManagerAsync(LeaveId);
        if(result.IsSuccess)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    /// <summary>
    /// Rejects a leave request by its ID, rejected by the manager who manages the employee.
    /// </summary>
    /// <param name="LeaveId">The ID of the leave request to reject.</param>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the result of the rejection operation.
    /// Returns 200 OK with the result if successful, or 400 Bad Request if the rejection fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 400 Bad Request if the rejection fails.
    /// </remarks>
    [HttpPut("RejectLeave")]
    [Authorize(Roles = "Manager")]
    [Authorize(Roles = $"{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> RejectLeave([FromQuery]Guid LeaveId)
    {
        var result = await _leaveRequestService.RejectLeaveRequestByManagerAsync(LeaveId);
        if(result.IsSuccess)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    /// <summary>
    /// Cancels a leave request by the employee, only if the status is pending.
    /// </summary>
    /// <param name="LeaveRequestId">The ID of the leave request to cancel.</param>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the result of the cancellation operation.
    /// Returns 200 OK with the result if successful, or 400 Bad Request if the cancellation fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 400 Bad Request if the cancellation fails.
    /// </remarks>
    [HttpPut("CancelLeaveRequest")]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> CancelLeaveRequest([FromQuery]Guid LeaveRequestId)
    {
        var result = await _leaveRequestService.CancelLeaveRequestBeforeApprovalByEmployeeIdAsync(LeaveRequestId);
        if (result.IsSuccess)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

    /// <summary>
    /// Submits a leave request by the employee.
    /// </summary>
    /// <param name="leaveRequest">The leave request details.</param>
    /// <returns>
    /// An <see cref="IActionResult"/> containing the result of the submission operation.
    /// Returns 200 OK with the result if successful, or 400 Bad Request if the submission fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 400 Bad Request if the submission fails.
    /// </remarks>
    [HttpPost]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PostLeaveRequest([FromBody] PostLeaveRequestDTO leaveRequest)
    {
        var result = await _leaveRequestService.SubmitLeaveRequestByEmployeeAsync(leaveRequest);
        if(!result.IsSuccess)
        {
            return BadRequest(result);
        }
        return Ok(result);  
    }

    /// <summary>
    /// Updates leave request details by the employee, only if the status is pending.
    /// </summary>
    /// <param name="leaveId">The ID of the leave request to update, provided in the query string.</param>
    /// <param name="leaveRequest">The updated leave request details provided in the request body.</param>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the result of the update operation.
    /// Returns 200 OK with the result if successful, or 400 Bad Request if the update fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the result if successful, or 400 Bad Request if the update fails.
    /// </remarks>
    [HttpPut]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> UpdateleaveRequest([FromQuery]Guid leaveId, [FromBody] UpdateLeaveRequestDTO leaveRequest)
    {
        var result = await _leaveRequestService.UpdateLeaveRequestStatusBeforeApprovalAsync(leaveId, leaveRequest);
        if(result.IsSuccess)
        {
            return Ok(result);
        }
        return BadRequest(result);
    }

}
