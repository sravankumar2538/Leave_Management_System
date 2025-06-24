using LeaveManagement.shared.OperationResult;

namespace LeaveManagement.Application.Services;
public class ShiftsService : IShiftsService
{

    private readonly IShiftsRepository _shiftsRepository;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;
    private readonly ILogger<ShiftsService> _logger;

    public ShiftsService(IShiftsRepository shiftsRepository, ITokenService tokenService, IMapper mapper, ILogger<ShiftsService> logger)
    {
        _shiftsRepository = shiftsRepository;
        _tokenService = tokenService;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<OperationResult<ICollection<ShiftsResponseDTO>>> GetAllEmployeesShiftsByManagerIdAsync()
    {
        _logger.LogInformation("GetAllEmployeesShiftsByManagerIdAsync Started at {Time}", DateTime.Now);
            // Employee Authentication
        int? managerId = _tokenService.GetUserIdFromCurrentRequest();
        if (managerId == null)
        {
            return OperationResult<ICollection<ShiftsResponseDTO>>.Failure("Authentication failed");
        }
        // fetching Empoloyees Assigned shifts by manager
        var Employees = await _shiftsRepository.GetAllEmployeesShiftsByManagerIdAsync((int)managerId);
        if(!Employees.IsSuccess)
        {
            return OperationResult<ICollection<ShiftsResponseDTO>>.Failure(Employees.Message);
        }
        // storing data in an result List
        List<ShiftsResponseDTO> result = new List<ShiftsResponseDTO>();
        result = _mapper.Map<List<ShiftsResponseDTO>>(Employees.Data);
        _logger.LogWarning("Authentication failed for GetAllEmployeesShiftsByManagerIdAsync at {Time}", DateTime.Now);
        // returning result list
        return OperationResult<ICollection<ShiftsResponseDTO>>.Success(result);
    }

    public async Task<OperationResult<ICollection<ShiftsResponseDTO>>> GetAllShiftsByEmployeeIdAsync()
    {
        // Log the start of the operation
        _logger.LogInformation("GetAllShiftsByEmployeeIdAsync called at {Time}", DateTime.Now);

        // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
            _logger.LogWarning("Authentication failed: User ID not found in current request.");
            return OperationResult<ICollection<ShiftsResponseDTO>>.Failure("Authentication failed: User ID not found.");
        }

        // Fetching Employee shifts as raw Shifts entities from the repository
        // The repository now returns ICollection<Shifts>
        var shiftsEntitiesResult = await _shiftsRepository.GetAllShiftsByEmployeeIdAsync((int)employeeId);

        // Check if the repository call was successful
        if (!shiftsEntitiesResult.IsSuccess)
        {
            _logger.LogWarning("Failed to retrieve shifts for employee ID {EmployeeId}: {Message}", employeeId, shiftsEntitiesResult.Message);
            return OperationResult<ICollection<ShiftsResponseDTO>>.Failure(shiftsEntitiesResult.Message);
        }

        // Map the collection of Shifts entities to a collection of ShiftsResponseDTOs
        // AutoMapper will use the configuration defined in your MappingProfile to handle the 'Status' logic.
        List<ShiftsResponseDTO> result = _mapper.Map<List<ShiftsResponseDTO>>(shiftsEntitiesResult.Data);

        // Log successful completion
        _logger.LogInformation("GetAllShiftsByEmployeeIdAsync completed successfully for employee ID {EmployeeId} at {Time}", employeeId, DateTime.Now);

        // Returning the mapped DTO list
        return OperationResult<ICollection<ShiftsResponseDTO>>.Success(result);
    }

    public async Task<OperationResult<string>> PostShiftToEmployeeByManagerIdAsync(AssignShiftsDTO shift)
    {
        _logger.LogInformation("PostShiftToEmployeeByManagerIdAsync called at {Time}", DateTime.Now);
            // Employee Authentication
        int? managerId = _tokenService.GetUserIdFromCurrentRequest();
        if (managerId == null)
        {
            return OperationResult<string>.Failure("Authentication failed");
        }
        if(shift.ShiftDate <= DateOnly.FromDateTime(DateTime.Now))
        {
            return OperationResult<string>.Failure("Cannot Assign Shifts for Today or Past Dates");
        }
        var shifts = _mapper.Map<Shifts>(shift);
        // Assigning shifts by manager
        var result = await _shiftsRepository.PostShiftToEmployeeByManagerIdAsync(shifts, (int)managerId);
        if(!result.IsSuccess)
        {
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("PostShiftToEmployeeByManagerIdAsync Completed at {Time}", DateTime.Now);
        // Returning final success message
        return OperationResult<string>.Success(result.Message);
    }

    public async Task<OperationResult<string>> UpdateShiftToEmployeeByManagerIdAsync(UpdateShiftAssignDTO Shift)
    {
        _logger.LogInformation("UpdateShiftToEmployeeByManagerIdAsync called at {Time}", DateTime.Now);
            // Employee Authentication
        int? managerId = _tokenService.GetUserIdFromCurrentRequest();
        if (managerId == null)
        {
                // If not Employee throws Unauthorised Exception
            return OperationResult<string>.Failure("Authentication failed");
        }
        if(Shift.ShiftDate == DateOnly.FromDateTime(DateTime.Now))
        {
            return OperationResult<string>.Failure("Can't Request for Today's Shift");
        }
        var updateShift =  _mapper.Map<Shifts>(Shift);
        // updating shift assignment by manager
        var result = await _shiftsRepository.UpdateShiftToEmployeeByManagerIdAsync(updateShift,(int)managerId);
        if(!result.IsSuccess)
        {
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("UpdateShiftToEmployeeByManagerIdAsync Completed at {Time}", DateTime.Now);
        // returning success message
        return OperationResult<string>.Success(result.Message);
    }
}
