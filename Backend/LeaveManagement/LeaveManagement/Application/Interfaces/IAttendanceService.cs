using LeaveManagement.shared.OperationResult;

namespace LeaveManagement.Application.Interfaces;

public interface IAttendanceService
{
    Task<OperationResult<ICollection<EmployeeAttendanceResponseDTO>>> GetEmployeeAttendanceByEmployeeIdAsync();
    Task <OperationResult<string>> PostClockInByEmployeeIdAsync();
    Task <OperationResult<string>>PostClockOutByEmployeeIdAsync();
    Task<OperationResult<ICollection<EmployeeAttendanceResponseDTO>>> GetEmployeeAttendanceInDateRangeByManagerIdAsync(DateOnly startDate, DateOnly endDate);
    Task<OperationResult<ICollection<EmployeeAttendanceResponseDTO>>> GetEmployeeAttendanceInDateRangByEmployeeIdAsync(DateOnly startDate, DateOnly endDate);

}
