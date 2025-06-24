namespace LeaveManagement.Application.Interfaces;

public interface IReportsService
{
    Task<OperationResult<ICollection<ReportResponseDto>>> GetEmployeeReportAsync();
}