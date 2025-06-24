using LeaveManagement.shared.Roles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _attendanceService;
    public AttendanceController(IAttendanceService attendanceService)   
    {
        _attendanceService = attendanceService;
    }

    /// <summary>
    /// Retrieves the weekly attendance of an employee by their ID.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult{T}"/> containing the attendance details.
    /// Returns 200 OK with the attendance details if successful, or 404 Not Found if no attendance records are found.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the attendance details if successful, or 404 Not Found if no attendance records are found.
    /// </remarks>

    [HttpGet("EmployeeWeekAttendance")]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<ICollection<AttendenceResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<AttendenceResponseDTO>>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetEmpAttendance()
    {
        var attendance = await _attendanceService.GetEmployeeAttendanceByEmployeeIdAsync();
        if (attendance.IsSuccess)
        {
            return Ok(attendance);
        }
        return NotFound(attendance);
    }

    /// <summary>
    /// Clocks in an employee.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult{T}"/> indicating the result of the clock-in operation.
    /// Returns 200 OK if the clock-in is successful, or 400 Bad Request if the operation fails.
    /// </returns>
    /// <remarks>
    /// This method allows an employee to clock in. It returns 200 OK if the clock-in is successful, or 400 Bad Request if the operation fails.
    /// </remarks>
    [HttpPost("ClockIn")]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PostClockIn()
    {
        var result = await _attendanceService.PostClockInByEmployeeIdAsync();
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Clocks out an employee.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult{T}"/> indicating the result of the clock-out operation.
    /// Returns 200 OK if the clock-out is successful, or 400 Bad Request if the operation fails.
    /// </returns>
    /// <remarks>
    /// This method allows an employee to clock out. It returns 200 OK if the clock-out is successful, or 400 Bad Request if the operation fails.
    /// </remarks>
    [HttpPost("ClockOut")]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<string>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PostClockOut()
    {
        var result = await _attendanceService.PostClockOutByEmployeeIdAsync();
        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Retrieves the attendance records of employees within a specified date range for a manager.
    /// </summary>
    /// <param name="startDate">The start date of the date range.</param>
    /// <param name="endDate">The end date of the date range.</param>
    /// <returns>
    /// An <see cref="ActionResult{T}"/> containing the attendance details.
    /// Returns 200 OK with the attendance details if successful, or 400 Bad Request if no attendance records are found.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the attendance details if successful, or 400 Bad Request if no attendance records are found.
    /// </remarks>
    [HttpGet("AttendanceInDateRangeByManager")]
    [Authorize(Roles = $"{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<ICollection<AttendenceResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<AttendenceResponseDTO>>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ICollection<Attendance>>> GetAttendanceByManagerIdAndDateRange([FromQuery] DateOnly startDate, DateOnly endDate)
    {
        var attendances = await _attendanceService.GetEmployeeAttendanceInDateRangeByManagerIdAsync(startDate, endDate);
        if (!attendances.IsSuccess)
        {
            return BadRequest(attendances);
        }
        return Ok(attendances);
    }


    /// <summary>
    /// Retrieves the attendance records of employees within a specified date range for a employee.
    /// </summary>
    /// <param name="startDate">The start date of the date range.</param>
    /// <param name="endDate">The end date of the date range.</param>
    /// <returns>
    /// An <see cref="ActionResult{T}"/> containing the attendance details.
    /// Returns 200 OK with the attendance details if successful, or 400 Bad Request if no attendance records are found.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the attendance details if successful, or 400 Bad Request if no attendance records are found.
    /// </remarks>
    [HttpGet("AttendanceInDateRangeByEmployeeId")]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester}")]
    [ProducesResponseType(typeof(OperationResult<ICollection<AttendenceResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<AttendenceResponseDTO>>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ICollection<EmployeeAttendanceResponseDTO>>> GetAttendanceByEmployeeIdAndDateRange([FromQuery] DateOnly startDate, [FromQuery] DateOnly endDate)
    {
        var attendances = await _attendanceService.GetEmployeeAttendanceInDateRangByEmployeeIdAsync(startDate, endDate);
        if (!attendances.IsSuccess)
        {
            return BadRequest(attendances);
        }
        return Ok(attendances);
    }
}

