// File: LeaveManagement.Application.Interfaces/IReportsRepository.cs
namespace LeaveManagement.Application.Interfaces;

// Renamed from IReportService to IReportsRepository
public interface IReportsRepository
{
    // This method MUST accept managerId, as your repository implementation uses it.
    Task<OperationResult<ICollection<ReportResponseDto>>> GetEmployeeReportAsync(int managerId);
}