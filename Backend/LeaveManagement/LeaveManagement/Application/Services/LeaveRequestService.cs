namespace LeaveManagement.Application.Services;

public class LeaveRequestService : ILeaveRequestService
{
    private readonly ILeaveRequestRepository _leaveRequestRepository;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;
    private readonly ILogger<LeaveRequestService> _logger;


    public LeaveRequestService(ILeaveRequestRepository leaveRequestRepository, ITokenService tokenService, IMapper mapper, ILogger<LeaveRequestService> logger)
    {
        _leaveRequestRepository = leaveRequestRepository;
        _tokenService = tokenService;
        _mapper = mapper;
        _logger = logger;
    }
    public async Task<OperationResult<ICollection<LeaveRequestStatusResponseDTO>>> GetEmployeeLeaveRequestStatusByEmployeeIdAsync()
    {
        _logger.LogInformation("GetEmployeeLeaveRequestStatusByEmployeeIdAsync Started at {Time}", DateTime.Now);
            // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
            return OperationResult<ICollection<LeaveRequestStatusResponseDTO>>.Failure("Authentication failed");
        }
        // fetching employee status by employeeId
        var leaveStatus = await _leaveRequestRepository.GetEmployeeLeaveRequestStatusByEmployeeIdAsync((int)employeeId);
        if(!leaveStatus.IsSuccess)
        {
            return OperationResult<ICollection<LeaveRequestStatusResponseDTO>>.Success(leaveStatus.Message);
        }
        // storing data in result list
        List<LeaveRequestStatusResponseDTO> result = new List<LeaveRequestStatusResponseDTO>();
        result = _mapper.Map<List<LeaveRequestStatusResponseDTO>>(leaveStatus.Data);
        _logger.LogInformation("GetEmployeeLeaveRequestStatusByEmployeeIdAsync completed at {Time}", DateTime.Now);
        // returning result list
        return OperationResult<ICollection<LeaveRequestStatusResponseDTO>>.Success(result);
    }

    public async Task<OperationResult<ICollection<LeaveRequestStatusResponseDTO>>> GetEmployeeRequestsByManagerIdAsync()
    {
        _logger.LogInformation("GetEmployeeRequestsByManagerIdAsync Started at {Time}", DateTime.Now);
            // Employee Authentication
        int? managerId = _tokenService.GetUserIdFromCurrentRequest();
        if (managerId == null)
        {
            return OperationResult<ICollection<LeaveRequestStatusResponseDTO>>.Failure("Authentication failed");
        }
        // getting employees pending request by manager
        var leaveStatus = await _leaveRequestRepository.GetEmployeeRequestsByManagerIdAsync((int)managerId);
        if(!leaveStatus.IsSuccess)
        {
            return OperationResult<ICollection<LeaveRequestStatusResponseDTO>>.Failure(leaveStatus.Message);
        }
        // storing data in an result list
        List<LeaveRequestStatusResponseDTO> result = new List<LeaveRequestStatusResponseDTO>();
        result = _mapper.Map<List<LeaveRequestStatusResponseDTO>>(leaveStatus.Data);
        _logger.LogInformation("GetEmployeeRequestsByManagerIdAsync completed at {Time}", DateTime.Now);
        // return success message
        return OperationResult<ICollection<LeaveRequestStatusResponseDTO>>.Success(result);
    }
    public async Task<OperationResult<string>> SubmitLeaveRequestByEmployeeAsync(PostLeaveRequestDTO leaveRequest)
    {
        _logger.LogInformation("SubmitLeaveRequestByEmployeeAsync started at {Time}", DateTime.Now);
            // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
            _logger.LogWarning("Authentication failed for SubmitLeaveRequestByEmployeeAsync at {Time}", DateTime.Now);
            return OperationResult<string>.Failure("Authentication failed");
        }
        // validating startdate and end date
        if (leaveRequest.StartDate > leaveRequest.EndDate)
        {
            return OperationResult<string>.Failure("check your dates");
        }
        // validating startdate is greater that today or not
        if (leaveRequest.StartDate == DateOnly.FromDateTime(DateTime.Now))
        {
            return OperationResult<string>.Failure("Leave cannot be applied for today");
        }
        if (leaveRequest.StartDate < DateOnly.FromDateTime(DateTime.Now))
        {
            return OperationResult<string>.Failure("Cannot Request Leave for Past Days");
        }
        var LeaveRequest = _mapper.Map<LeaveRequest>(leaveRequest);
        LeaveRequest.EmployeeId = (int)employeeId;
        // Employee submitting leave request for Approval
        var result = await _leaveRequestRepository.SubmitLeaveRequestByEmployeeAsync(LeaveRequest);
        if (!result.IsSuccess)
        {
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("SubmitLeaveRequestByEmployeeAsync Completed at {Time}", DateTime.Now);
        // returns the final success message
        return OperationResult<string>.Success(result.Message);
    }
    public async Task<OperationResult<string>> ApproveLeaveRequestByManagerAsync(Guid leaveId)
    {
        _logger.LogInformation("ApproveLeaveRequestByManagerAsync started at {Time}", DateTime.Now);  
            // Employee Authentication
        int? managerId = _tokenService.GetUserIdFromCurrentRequest();
        if (managerId == null)
        {
            return OperationResult<string>.Failure("Authentication failed");
        }
        // Approving leave request by manager 
        var result = await _leaveRequestRepository.ApproveLeaveRequestByManagerAsync(leaveId, (int)managerId);
        if (!result.IsSuccess)
        {
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("ApproveLeaveRequestByManagerAsync Completed at {Time}", DateTime.Now);
        // returns the final success message
        return OperationResult<string>.Success(result.Message);
    }
    public async Task<OperationResult<string>> CancelLeaveRequestBeforeApprovalByEmployeeIdAsync(Guid LeaveId)
    {
        _logger.LogInformation("CancelLeaveRequestBeforeApprovalByEmployeeIdAsync started at {Time}", DateTime.Now);
            // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
            return OperationResult<string>.Failure("Authentication failed");
        }
        // cancelling leave request by employee themselves
        var result = await _leaveRequestRepository.CancelLeaveRequestBeforeApprovalByEmployeeIdAsync(LeaveId,(int)employeeId);
        if (!result.IsSuccess)
        {
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("CancelLeaveRequestBeforeApprovalByEmployeeIdAsync Completed at {Time}", DateTime.Now);
        // returns final success message
        return OperationResult<string>.Success(result.Message);
    }
    
    public async Task<OperationResult<string>> RejectLeaveRequestByManagerAsync(Guid leaveId)
    {
        _logger.LogInformation("RejectLeaveRequestByManagerAsync started at {Time}", DateTime.Now);
            // Employee Authentication
        int? managerId = _tokenService.GetUserIdFromCurrentRequest();
        if (managerId == null)
        {
            return OperationResult<string>.Failure("Authentication failed");
        }
        // rejecting leave request by manager
        var result = await _leaveRequestRepository.RejectLeaveRequestByManagerAsync(leaveId,(int)managerId);
        if(!result.IsSuccess)
        {
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("RejectLeaveRequestByManagerAsync Completed at {Time}", DateTime.Now);
        // returning final message
        return OperationResult<string>.Success(result.Message);
    }

    public async Task<OperationResult<string>> UpdateLeaveRequestStatusBeforeApprovalAsync(Guid leaveId, UpdateLeaveRequestDTO updateLeaveRequest)
    {
        _logger.LogInformation("UpdateLeaveRequestStatusBeforeApprovalAsync started at {Time}", DateTime.Now);
            // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
                // If not Employee throws Unauthorised Exception
            return OperationResult<string>.Failure("Authentication failed");
        }
        if(updateLeaveRequest.StartDate <= DateOnly.FromDateTime(DateTime.Now))
        {
            return OperationResult<string>.Failure("Leave Cannot be updated for current Day");
        }
        var updateLeave = _mapper.Map<LeaveRequest>(updateLeaveRequest);
        updateLeave.EmployeeId = (int)employeeId;
        // updating leave resquest
        var result = await _leaveRequestRepository.UpdateLeaveRequestStatusBeforeApprovalAsync(leaveId, updateLeave);
        if (!result.IsSuccess)
        {
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("UpdateLeaveRequestStatusBeforeApprovalAsync Completed at {Time}", DateTime.Now);
        // returning succes message 
        return OperationResult<string>.Success(result.Message);
    }
}
