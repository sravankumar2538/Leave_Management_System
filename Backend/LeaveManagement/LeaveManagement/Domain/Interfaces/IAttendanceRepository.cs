namespace LeaveManagement.Domain.Interfaces;

public interface IAttendanceRepository
{
    
    Task<OperationResult<ICollection<Attendance>>> GetEmployeeAttendanceByEmployeeIdAsync(int employeeId);
    Task<OperationResult <string>>PostClockInByEmployeeIdAsync(int employeeId);
    Task<OperationResult<string>> PostClockOutByEmployeeIdAsync(int employeeId);
    Task<OperationResult<ICollection<Attendance>>> GetEmployeeAttendanceInDateRangeByManagerIdAsync(int managerId, DateOnly startDate, DateOnly endDate);

    Task<OperationResult<ICollection<Attendance>>> GetEmployeeAttendanceInDateRangByEmployeeIdeAsync(int employeeId, DateOnly startDate, DateOnly endDate);
 
}














