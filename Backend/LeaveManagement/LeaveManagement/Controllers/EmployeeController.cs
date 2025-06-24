using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
namespace LeaveManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeService _employeeService;
    private readonly ITokenService _tokenService;

    public EmployeeController( IEmployeeService employeeService, ITokenService tokenService)
    {
        _employeeService = employeeService;
        _tokenService = tokenService;   
    }

    /// <summary>
    /// Retrieves all employees managed by a specific manager.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the employee data.
    /// Returns 200 OK with the employee data if successful, or 404 Not Found if no employees are found.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the employee data if successful, or 404 Not Found if no employees are found.
    /// </remarks>
    [HttpGet("AllEmployeesByManagerId")]
    [Authorize(Roles = $"{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<ICollection<EmployeeListResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<EmployeeListResponseDTO>>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetEmployeeByManagerId()
    {
        var employee = await _employeeService.GetAllEmployeeDataByManagerIdAsync();
        if (!employee.IsSuccess)
        {
            return NotFound(employee);
        }
        return Ok(employee);
    }

    /// <summary>
    /// Retrieves the profile of an employee by their ID.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the employee profile.
    /// Returns 200 OK with the profile if successful, or 404 Not Found if the profile is not found.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the profile if successful, or 404 Not Found if the profile is not found.
    /// </remarks>
    [HttpGet("EmployeeProfile")]
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester},{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<ICollection<EmployeeListResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<EmployeeListResponseDTO>>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetEmployeeByEmpId()
    {
        var employee = await _employeeService.GetEmployeeProfileAsync();
        if (employee.IsSuccess)
        {
            return Ok(employee);
        }
        return NotFound(employee);
    }

    /// <summary>
    /// Authenticates an employee or manager using their email and password, and logs them into the portal.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the authentication result.
    /// Returns 200 OK with a token if successful, or 400 Bad Request if the login fails.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with a token if successful, or 400 Bad Request if the login fails.
    /// </remarks>
    [HttpPost("Login")]
    [ProducesResponseType(typeof(OperationResult<Employee>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<Employee>), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> EmployeeLogin([FromBody] LoginDTO login)
    {
        var userResult = await _employeeService.LoginEmployeeToPortalAsync(login);
        if (!userResult.IsSuccess || userResult.Data == null || string.IsNullOrEmpty(userResult.Data.Role))
        {
            return BadRequest(userResult);
        }
        if (userResult.IsSuccess)
        {
            Response.Cookies.Append("jwt", userResult.Data.Token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddHours(1)
            });
        }
        return Ok(userResult);
    }

    /// <summary>
    /// Retrieves the employees managed by a specific manager who are present on the current day.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult"/> containing the employee data.
    /// Returns 200 OK with the employee data if successful, or 404 Not Found if no employees are found.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the employee data if successful, or 404 Not Found if no employees are found.
    /// </remarks>
    [HttpGet("CurrentDayEmployeeByManagerId")]
    [Authorize(Roles = $"{Roles.Manager}")]
    [ProducesResponseType(typeof(OperationResult<EmployeeListResponseDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<EmployeeListResponseDTO>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> GetCurrentDayEmployeeByManagerId()
    {
        var employee = await _employeeService.GetCurrentDayEmployeesByManagerId();
        if (!employee.IsSuccess)
        {
            return NotFound(employee);
        }
        return Ok(employee);
    }

    /// <summary>
    /// Logs out the currently authenticated user from the portal, invalidating their session or token.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult"/> indicating the outcome of the logout operation.
    /// Returns 200 OK if the logout is successful, or an appropriate error status (e.g., 400 Bad Request, 401 Unauthorized)
    /// if the logout fails due to an invalid request or no active session.
    /// </returns>
    /// <remarks>
    /// This method invalidates the user's authentication token or session, effectively logging them out.
    /// It typically returns 200 OK upon successful invalidation.
    /// </remarks>
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester},{Roles.Manager}")]
    [HttpPost("Logout")]
    [ProducesResponseType(typeof(OperationResult<Employee>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<Employee>), StatusCodes.Status400BadRequest)]
    public ActionResult Logout()
    {
        Response.Cookies.Delete("jwt", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None, // This should match the SameSiteMode used when setting the cookie
            Expires = DateTimeOffset.UtcNow.AddDays(-1)
        });
        return Ok(new { message = "Logout successful" });
    }

    /// <summary>
    /// Retrieves a list of employees who are absent on the current date, filtered by manager.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult"/> containing an <see cref="OperationResult{T}"/> of a collection of <see cref="Employee"/> objects.
    /// Returns 200 OK with the list of absent employees if successful.
    /// Returns 404 Not Found if the retrieval fails (e.g., no employees found or an internal service error).
    /// </returns>
    /// <remarks>
    /// This endpoint requires the user to have the 'Manager' role.
    /// It queries the database for employees who are not marked as present for the current day.
    /// </remarks>
    [Authorize(Roles = $"{Roles.Manager}")]
    [HttpGet("AbsentEmployees")]
    [ProducesResponseType(typeof(OperationResult<EmployeeListResponseDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<EmployeeListResponseDTO>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult> AbsentEmployeeList()
    {
        var employeeList = await _employeeService.GetAbsentEmployeesListAsync();
        if (!employeeList.IsSuccess)
        {
            return NotFound(employeeList);
        }
        return Ok(employeeList);
    }


    /// <summary>
    /// Retrieves the role information for the current user or system.
    /// </summary>
    /// <returns>
    /// An <see cref="ActionResult"/> containing an <see cref="OperationResult{T}"/> of the role data.
    /// Returns 200 OK with the role information if successful.
    /// Returns 400 Bad Request if the retrieval fails (e.g., service error, no role found).
    /// </returns>
    /// <remarks>
    /// This endpoint requires the user to have one of the following roles:
    /// 'MaintenanceEngineer', 'Developer', 'NetworkEngineer', 'DevOpsEngineer',
    /// 'DatabaseAdministrator', 'Tester', or 'Manager'.
    /// It delegates the retrieval of role information to the employee service.
    /// </remarks>
    [Authorize(Roles = $"{Roles.MaintenanceEngineer},{Roles.Developer},{Roles.NetworkEngineer},{Roles.DevOpsEngineer},{Roles.DatabaseAdministrator},{Roles.Tester},{Roles.Manager}")]
    [HttpGet("getRole")]
    public ActionResult GetRole()
    {
        var res =  _employeeService.GetRoleService();
        if (!res.IsSuccess)
        {
            return BadRequest(res);
        }
        return Ok(res);
    }


}



