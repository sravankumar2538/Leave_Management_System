namespace LeaveManagement.Application.Interfaces;

public interface IEmployeeService
{
    Task<OperationResult<ICollection<EmployeeListResponseDTO>>> GetAllEmployeeDataByManagerIdAsync();
    Task<OperationResult<ICollection<EmployeeListResponseDTO>>> GetAbsentEmployeesListAsync();
    Task<OperationResult<LoginResponseDto>> LoginEmployeeToPortalAsync(LoginDTO login);
    Task<OperationResult<ICollection<EmployeeListResponseDTO>>> GetEmployeeProfileAsync();

    Task<OperationResult<ICollection<EmployeeListResponseDTO>>> GetCurrentDayEmployeesByManagerId();
    Task<OperationResult<EmployeeListResponseDTO>> GetEmployeeDetailsByEmail(string email);
    OperationResult<string> GetRoleService();


}
