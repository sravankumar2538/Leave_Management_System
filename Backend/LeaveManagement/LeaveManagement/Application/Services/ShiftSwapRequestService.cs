namespace LeaveManagement.Application.Services;

public class ShiftSwapRequestService : IShiftSwapRequestService
{

    private readonly IShiftSwapRequestRepository _shiftSwapRequestRepository;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;
    private readonly ILogger<ShiftSwapRequestService> _logger;


    public ShiftSwapRequestService(IShiftSwapRequestRepository shiftSwapRequestRepository, ITokenService tokenService, IMapper mapper, ILogger<ShiftSwapRequestService> logger)
    {
        _shiftSwapRequestRepository = shiftSwapRequestRepository;
        _tokenService = tokenService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<OperationResult<ICollection<ShiftSwapRequestResponseDTO>>> GetAllShiftSwapRequestsByManagerIdAsync()
    {
        _logger.LogInformation("GetAllShiftSwapRequestsByManagerIdAsync called at {Time}", DateTime.Now);
            // Employee Authentication
        int? managerId = _tokenService.GetUserIdFromCurrentRequest();
        if (managerId == null)
        {
            return OperationResult<ICollection<ShiftSwapRequestResponseDTO>>.Failure("Authentication failed");
        }
        // fetching pending shift swap requests by manager
        var request = await _shiftSwapRequestRepository.GetAllShiftSwapRequestsByManagerIdAsync((int)managerId);
        if(!request.IsSuccess)
        {
            return OperationResult<ICollection<ShiftSwapRequestResponseDTO>>.Failure(request.Message);
        }
        // storing data in result list
        List<ShiftSwapRequestResponseDTO> result = new List<ShiftSwapRequestResponseDTO>();
        result = _mapper.Map<List<ShiftSwapRequestResponseDTO>>(request.Data);
        _logger.LogInformation("GetAllShiftSwapRequestsByManagerIdAsync called at {Time}", DateTime.Now);
        // returning result list
        return OperationResult<ICollection<ShiftSwapRequestResponseDTO>>.Success(result);
    }

    public async Task<OperationResult<ICollection<ShiftSwapRequestResponseDTO>>> GetShiftSwapStatusByEmployeeIdAsync()
    {
        _logger.LogInformation("GetShiftSwapStatusByEmployeeIdAsync called at {Time}", DateTime.Now);
            // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
            return OperationResult<ICollection<ShiftSwapRequestResponseDTO>>.Failure("Authentication failed");
        }
        // fetch shift swap requests by employee 
        var request = await _shiftSwapRequestRepository.GetShiftSwapStatusByEmployeeIdAsync((int)employeeId);
        if(!request.IsSuccess)
        {
            return OperationResult<ICollection<ShiftSwapRequestResponseDTO>>.Failure(request.Message);
        }
        // storing data in result list
        List<ShiftSwapRequestResponseDTO> result = new List<ShiftSwapRequestResponseDTO>();
        result = _mapper.Map<List<ShiftSwapRequestResponseDTO>>(request.Data);
        _logger.LogInformation("GetShiftSwapStatusByEmployeeIdAsync Completed at {Time}", DateTime.Now);
        // returning result list
        return OperationResult<ICollection<ShiftSwapRequestResponseDTO>>.Success(result);
    }
    public async Task <OperationResult<string>>CreateShiftSwapRequestAsync(PostShiftSwapRequestDTO shiftSwapRequest)
    {
        _logger.LogInformation("CreateShiftSwapRequestAsync called at {Time}", DateTime.Now);
            // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
            return OperationResult<string>.Failure("Authentication failed");
        }
        if (shiftSwapRequest.ShiftDate == DateOnly.FromDateTime(DateTime.Now))
        {
            return OperationResult<string>.Failure("Can't Request for Today's Shift");
        }
        
        var request = _mapper.Map<ShiftSwapRequest>(shiftSwapRequest);
        // Creating shift swap request by employee
        var result = await _shiftSwapRequestRepository.CreateShiftSwapRequestAsync((int)employeeId, request);
        if(!result.IsSuccess)
        {
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("CreateShiftSwapRequestAsync Completed at {Time}", DateTime.Now);
        // returning Success message
        return OperationResult<string>.Success(result.Message);

    }
    public async Task<OperationResult<string>> ApproveShiftSwapRequestByManagerIdAsync(Guid ShiftRequestId)
    {
        _logger.LogInformation("ApproveShiftSwapRequestByManagerIdAsync called at {Time}", DateTime.Now);
            // Employee Authentication
        int? managerId = _tokenService.GetUserIdFromCurrentRequest();
        if (managerId == null)
        {
            return OperationResult<string>.Failure("Authentication failed");
        }
        // Approving shift swap request by manager 
        var result = await _shiftSwapRequestRepository.ApproveShiftSwapRequestByManagerIdAsync(ShiftRequestId,(int)managerId);
        if (!result.IsSuccess)
        {
            _logger.LogError("Failed to approve shift swap  for manager ID {ManagerId} at {Time}: {Message}", managerId, DateTime.Now, result.Message);
            // returning Success message
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("ApproveShiftSwapRequestByManagerIdAsync Completed at {Time}", DateTime.Now);
        return OperationResult<string>.Success(result.Message);
    }

    public async Task<OperationResult<string>> CancelShiftSwapByEmployeeIdAsync(Guid ShiftRequestId)
    {
        _logger.LogInformation("CancelShiftSwapByEmployeeIdAsync called at {Time}", DateTime.Now);
            // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
                // If not Employee throws Unauthorised Exception
            return OperationResult<string>.Failure("Authentication failed");
        }
        // cancelling shift swap request by employee before approval by manager
        var result = await _shiftSwapRequestRepository.CancelShiftSwapByEmployeeIdAsync(ShiftRequestId,(int)employeeId);
        if (!result.IsSuccess)
        {
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("CancelShiftSwapByEmployeeIdAsync Completed at {Time}", DateTime.Now);
        // returning Success message
        return OperationResult<string>.Success(result.Message);

    }
    public async Task<OperationResult<string>> RejectShiftSwapRequestByManagerIdAsync(Guid ShiftRequestId)
    {
        _logger.LogInformation("RejectShiftSwapRequestByManagerIdAsync called at {Time}", DateTime.Now);
            // Employee Authentication
        int? managerId = _tokenService.GetUserIdFromCurrentRequest();
        if (managerId == null)
        {
                // If not Employee throws Unauthorised Exception
            return OperationResult<string>.Failure("Authentication failed");
        }
        // Rejecting Shift swap request by manager
        var result = await _shiftSwapRequestRepository.RejectShiftSwapRequestByManagerIdAsync(ShiftRequestId,(int)managerId);
        if (!result.IsSuccess)
        {
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("RejectShiftSwapRequestByManagerIdAsync Completed at {Time}", DateTime.Now);
        // returning Success message
        return OperationResult<string>.Success(result.Message);
    }

    public async Task<OperationResult<string>> UpdateShiftSwapRequestAsync(Guid ShiftRequestId, UpdateSwapShiftDTO shiftSwapRequest)
    {
        _logger.LogInformation("UpdateShiftSwapRequestAsync called at {Time}", DateTime.Now);
            // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
                // If not Employee throws Unauthorised Exception
            return OperationResult<string>.Failure("Authentication failed");
        }
        if (shiftSwapRequest.ShiftDate == DateOnly.FromDateTime(DateTime.Now))
        {
            return OperationResult<string>.Failure("Cannot update shift for Today");
        }
        var ShiftSwapRequest = _mapper.Map<ShiftSwapRequest>(shiftSwapRequest);
        // Updating shift swap request by employee
        var result = await _shiftSwapRequestRepository.UpdateShiftSwapRequestAsync(ShiftRequestId, ShiftSwapRequest,(int)employeeId);
        if (!result.IsSuccess)
        {
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("UpdateShiftSwapRequestAsync Completed at {Time}", DateTime.Now);
        // returning Success message
        return OperationResult<string>.Success(result.Message);
    }
}
