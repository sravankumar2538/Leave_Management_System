// File: LeaveManagement.Application.Services/ReportsService.cs
using LeaveManagement.Application.Interfaces;
using LeaveManagement.Application.DTOs; // Added for ReportResponseDto
// Assuming OperationResult is in a shared namespace or here
// using LeaveManagement.Shared; // Example for OperationResult

namespace LeaveManagement.Application.Services;

public class ReportsService : IReportsService
{
    private readonly IReportsRepository _reportsRepository; // Corrected to IReportsRepository
    private readonly ITokenService _tokenService;

    public ReportsService(IReportsRepository reportsRepository, ITokenService tokenService)
    {
        _reportsRepository = reportsRepository;
        _tokenService = tokenService;
    }

    public async Task<OperationResult<ICollection<ReportResponseDto>>> GetEmployeeReportAsync()
    {
        // Get the employeeId (which is the managerId for the current user) from the token
        int? managerId = _tokenService.GetUserIdFromCurrentRequest();

        if (managerId == null)
        {
            // Log this if you have a logger available (_logger.LogInformation(...))
            return OperationResult<ICollection<ReportResponseDto>>.Failure("Authentication failed: Manager ID not found in token.");
        }

        // Call the repository with the obtained managerId
        var result = await _reportsRepository.GetEmployeeReportAsync((int)managerId);

        // Fix: You were double-wrapping the OperationResult.
        // The repository already returns an OperationResult.
        if (result.IsSuccess)
        {
            return result; // Return the success result directly from the repository
        }
        else
        {
            // If the repository operation failed, return its failure message or a generic one
            return OperationResult<ICollection<ReportResponseDto>>.Failure(result.Message ?? "Failed to retrieve employee report data.");
        }
    }
}