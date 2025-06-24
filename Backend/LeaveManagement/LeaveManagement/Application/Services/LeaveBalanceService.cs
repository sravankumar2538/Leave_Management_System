namespace LeaveManagement.Application.Services;

public class LeaveBalanceService : ILeaveBalanceService
{
    private readonly ILeaveBalanceRepository _leaveBalanceRepository;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;
    private readonly ILogger<LeaveBalanceService> _logger;

    public LeaveBalanceService(ILeaveBalanceRepository leaveBalanceRepository, ITokenService tokenService, IMapper mapper, ILogger<LeaveBalanceService> logger)
    {
        _leaveBalanceRepository = leaveBalanceRepository;
        _tokenService = tokenService;
        _mapper = mapper;
        _logger = logger;
    }
    public async Task<OperationResult<ICollection<LeaveBalanceResponseDTO>>> GetLeaveBalanceByEmployeeIdAsync()
    {
        _logger.LogInformation("GetLeaveBalanceByEmployeeIdAsync Started at {Time}", DateTime.Now);
            // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
                // If not Employee throws Unauthorised Exception
            return OperationResult<ICollection<LeaveBalanceResponseDTO>>.Failure("Authentication failed");
        }
        // fetching leavebalance of an Employee using EmployeeId
        var leaveBalance = await _leaveBalanceRepository.GetLeaveBalanceByEmployeeIdAsync((int) employeeId);
        if (!leaveBalance.IsSuccess)
        {
            return OperationResult<ICollection<LeaveBalanceResponseDTO>>.Failure(leaveBalance.Message);
        }
        // Storing data in an list named result
        List<LeaveBalanceResponseDTO> result = new List<LeaveBalanceResponseDTO>();
        result = _mapper.Map<List<LeaveBalanceResponseDTO>>(leaveBalance.Data);
        _logger.LogInformation("GetLeaveBalanceByEmployeeIdAsync completed successfully at {Time}", DateTime.Now);
        // returing that result list
        return OperationResult<ICollection<LeaveBalanceResponseDTO>>.Success(result);
    }
}
