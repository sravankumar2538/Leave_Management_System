namespace LeaveManagement.Application.Services;

public class AttendanceService : IAttendanceService
{
    private readonly IAttendanceRepository _attendanceRepository;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;
    private readonly ILogger<AttendanceService> _logger;

    public AttendanceService(IAttendanceRepository attendanceRepository, ITokenService tokenService, IMapper mapper, ILogger<AttendanceService> logger)
    {
        _attendanceRepository = attendanceRepository;
        _tokenService = tokenService;
        _mapper = mapper;
        _logger = logger;
    }
   
    public async Task<OperationResult<ICollection<EmployeeAttendanceResponseDTO>>> GetEmployeeAttendanceByEmployeeIdAsync()
    {
        _logger.LogInformation("GetEmployeeAttendanceByEmployeeIdAsync Started at {Time}", DateTime.Now);
        // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
            return OperationResult<ICollection<EmployeeAttendanceResponseDTO>>.Failure("Authentication failed");
        }
        // Fetching Employee Attendance using EmployeeId
        var Attendance = await _attendanceRepository.GetEmployeeAttendanceByEmployeeIdAsync((int)employeeId);
        if(!Attendance.IsSuccess)
        {
            // If an Error Occurs
            return OperationResult<ICollection<EmployeeAttendanceResponseDTO>>.Failure(Attendance.Message);
        }
        // Storing data in List name result
        List<EmployeeAttendanceResponseDTO> result = new List<EmployeeAttendanceResponseDTO>();
        result = _mapper.Map<List<EmployeeAttendanceResponseDTO>>(Attendance.Data);
        _logger.LogInformation("GetEmployeeAttendanceByEmployeeIdAsync completed at {Time}", DateTime.Now);
        // Returning the result list here
        return OperationResult<ICollection<EmployeeAttendanceResponseDTO>>.Success(result);

    }
    public async Task<OperationResult<ICollection<EmployeeAttendanceResponseDTO>>> GetEmployeeAttendanceInDateRangByEmployeeIdAsync(DateOnly startDate, DateOnly endDate)
    {
        _logger.LogInformation("GetEmployeeAttendanceInDateRangByEmployeeIdAsync Started at {Time}", DateTime.Now);
        // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
            return OperationResult<ICollection<EmployeeAttendanceResponseDTO>>.Failure("Authentication failed");
        }
        // validating the dates where Entered dates correct order or not
        if (startDate > endDate)
        {
            // If not throws an Error Message
            return OperationResult<ICollection<EmployeeAttendanceResponseDTO>>.Failure("Invalid Date Range");
        }
        // fetching Attendance data of an employee using Date Range by EmployeeID
        var attendance = await _attendanceRepository.GetEmployeeAttendanceInDateRangByEmployeeIdeAsync((int)employeeId, startDate, endDate);
        if (!attendance.IsSuccess)
        {
            // If error thorws Exception
            return OperationResult<ICollection<EmployeeAttendanceResponseDTO>>.Failure(attendance.Message);
        }
        if (attendance.Data == null || !attendance.Data.Any())
        {
            // If data is null throws Not Data Found Exception
            return OperationResult<ICollection<EmployeeAttendanceResponseDTO>>.Success(attendance.Message ?? "No Data found.");
        }
        // storing data in result List
        var result = _mapper.Map<List<EmployeeAttendanceResponseDTO>>(attendance.Data);
        _logger.LogInformation("GetEmployeeAttendanceInDateRangByEmployeeIdAsync completed at {Time}", DateTime.Now);
        // returining result List
        return OperationResult<ICollection<EmployeeAttendanceResponseDTO>>.Success(result);
    }

    public async Task<OperationResult<ICollection<EmployeeAttendanceResponseDTO>>> GetEmployeeAttendanceInDateRangeByManagerIdAsync(DateOnly startDate, DateOnly endDate)
    {
        _logger.LogInformation("GetEmployeeAttendanceInDateRangeByManagerIdAsync Started at {Time}", DateTime.Now);
        // Employee Authentication
        int? managerId = _tokenService.GetUserIdFromCurrentRequest();
        if (managerId == null)
        {
            // If ManagerId error occur throws Authentication failes - unauthorized Exception
            return OperationResult<ICollection<EmployeeAttendanceResponseDTO>>.Failure("Authentication failed");
        }
        if (startDate > DateOnly.FromDateTime(DateTime.Now))
        {
            return OperationResult<ICollection<EmployeeAttendanceResponseDTO>>.Failure("Please check Date Range");
        }
        // validating the dates where Entered dates correct order or not
        if (startDate > endDate)
        {
            return OperationResult<ICollection<EmployeeAttendanceResponseDTO>>.Failure("Invalid Date Range");
        }
        
        // fetching Attendance data of an employee using Date Range by ManagerID
        var Attendance = await _attendanceRepository.GetEmployeeAttendanceInDateRangeByManagerIdAsync((int)managerId, startDate, endDate);
        if(!Attendance.IsSuccess)
        {
            return OperationResult<ICollection<EmployeeAttendanceResponseDTO>>.Failure(Attendance.Message);
        }
        // storing data in result List
        List<EmployeeAttendanceResponseDTO> result = new List<EmployeeAttendanceResponseDTO>();
        result = _mapper.Map<List<EmployeeAttendanceResponseDTO>>(Attendance.Data);
        _logger.LogInformation("GetEmployeeAttendanceInDateRangeByManagerIdAsync completed at {Time}", DateTime.Now);
        // returning the result list
        return OperationResult<ICollection<EmployeeAttendanceResponseDTO>>.Success(result);
    }

    public async Task<OperationResult<string>> PostClockInByEmployeeIdAsync()
    {
        _logger.LogInformation("PostClockInByEmployeeIdAsync Started at {Time}", DateTime.Now);
        // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
            return OperationResult<string>.Failure("Authentication failed");
        }
        // marking Clock-In attendance
        var result = await _attendanceRepository.PostClockInByEmployeeIdAsync((int)employeeId);
        if(!result.IsSuccess)
        {
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("PostClockInByEmployeeIdAsync completed at {Time}", DateTime.Now);
        // Returning final message
        return OperationResult<string>.Success(result.Message);
    }

    public async Task<OperationResult<string>> PostClockOutByEmployeeIdAsync()
    {
        _logger.LogInformation("PostClockOutByEmployeeIdAsync Started at {Time}", DateTime.Now);
        // Employee Authentication
        int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
        if (employeeId == null)
        {
            return OperationResult<string>.Failure("Authentication failed");
        }
        // Marking clock-out attendance
        var result = await _attendanceRepository.PostClockOutByEmployeeIdAsync((int)employeeId);
        if(!result.IsSuccess)
        {
            // Error occur throws Exception message
            return OperationResult<string>.Failure(result.Message);
        }
        _logger.LogInformation("PostClockOutByEmployeeIdAsync completed at {Time}", DateTime.Now);
        // Returning final message
        return OperationResult<string>.Success(result.Message);
    }
}
