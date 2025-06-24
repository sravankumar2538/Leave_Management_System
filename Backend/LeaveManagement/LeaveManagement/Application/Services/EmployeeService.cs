using Microsoft.AspNetCore.Identity.Data;
using System.Text.RegularExpressions;

namespace LeaveManagement.Application.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly ITokenService _tokenService;
        private readonly IMapper _mapper;
        private readonly ILogger<EmployeeService> _logger;

        public EmployeeService(IEmployeeRepository employeeRepository, ITokenService tokenService, IMapper mapper, ILogger<EmployeeService> logger)
        {
            _employeeRepository = employeeRepository;
            _tokenService = tokenService;
            _mapper = mapper;
            _logger = logger;
        }
        public async Task<OperationResult<ICollection<EmployeeListResponseDTO>>> GetAllEmployeeDataByManagerIdAsync()
        {
            _logger.LogInformation($"GetAllEmployeeDataByManagerIdAsync Service Started at {DateTime.Now}");
            // Employee Authentication
            int? managerId = _tokenService.GetUserIdFromCurrentRequest();

            if (managerId == null)
            {
                // If not Employee throws Unauthorised Exception
                return OperationResult<ICollection<EmployeeListResponseDTO>>.Failure("Authentication failed");
            }
            // Getting all employee data working under particular manager using managerID
            var employees = await _employeeRepository.GetAllEmployeeDataByManagerIdAsync((int)managerId);
            if (!employees.IsSuccess)
            {
                return OperationResult<ICollection<EmployeeListResponseDTO>>.Failure(employees.Message);
            }
            // storing data in an List named result
            List<EmployeeListResponseDTO> result = new List<EmployeeListResponseDTO>();
            result = _mapper.Map<List<EmployeeListResponseDTO>>(employees.Data);
            _logger.LogInformation($"GetAllEmployeeDataByManagerIdAsync Service Completed at {DateTime.Now}");
            // returing result list
            return OperationResult<ICollection<EmployeeListResponseDTO>>.Success(result);

        }

        public async Task<OperationResult<ICollection<EmployeeListResponseDTO>>> GetCurrentDayEmployeesByManagerId()
        {
            _logger.LogInformation($"GetCurrentDayEmployeesByManagerId Service Started at {DateTime.Now}");
            // Employee Authentication
            int? managerId = _tokenService.GetUserIdFromCurrentRequest();
            if (managerId == null)
            {
                // If not Employee throws Unauthorised Exception
                return OperationResult<ICollection<EmployeeListResponseDTO>>.Failure("Authentication failed");
            }
            // fetching current day employees working under a manager
            var employees = await _employeeRepository.GetCurrentDayEmployeesByManagerId((int)managerId);
            // Storing data in an List named result
            List<EmployeeListResponseDTO> result = new List<EmployeeListResponseDTO>();
            if (!employees.IsSuccess)
            {
                return OperationResult<ICollection<EmployeeListResponseDTO>>.Failure(employees.Message);
            }
            result = _mapper.Map<List<EmployeeListResponseDTO>>(employees.Data);
            _logger.LogInformation($"GetCurrentDayEmployeesByManagerId Service Completed at {DateTime.Now}");
            // returning the result List
            return OperationResult<ICollection<EmployeeListResponseDTO>>.Success(result);
        }

      

        public async Task<OperationResult<ICollection<EmployeeListResponseDTO>>> GetEmployeeProfileAsync()
        {
            _logger.LogInformation($"GetEmployeeProfileAsync Service Started at {DateTime.Now}");
            // Employee Authentication
            int? employeeId = _tokenService.GetUserIdFromCurrentRequest();
            if (employeeId == null)
            {
                // If not Employee throws Unauthorised Exception
                return OperationResult<ICollection<EmployeeListResponseDTO>>.Failure("Authentication failed");
            }
            // fetching data of particular Employee using EmployeeId
            var employee = await _employeeRepository.GetEmployeeProfileAsync((int)employeeId);
            if (!employee.IsSuccess)
            {
                return OperationResult<ICollection<EmployeeListResponseDTO>>.Failure(employee.Message);
            }
            // storing data in an result List
            List<EmployeeListResponseDTO> result = new List<EmployeeListResponseDTO>();
            result = _mapper.Map<List<EmployeeListResponseDTO>>(employee.Data);
            _logger.LogInformation($"GetEmployeeProfileAsync Service Completed at {DateTime.Now}");
            // returning result List
            return OperationResult<ICollection<EmployeeListResponseDTO>>.Success(result);
        }

        public async Task<OperationResult<LoginResponseDto>> LoginEmployeeToPortalAsync(LoginDTO dto)
        {
            _logger.LogInformation("Login attempt for employee with email: {Email}", dto.Email);
            // validating request fields
            if(dto.Email == null || string.IsNullOrWhiteSpace(dto.Email))
            {
                return OperationResult<LoginResponseDto>.Failure("Please Enter Email");
            }
            if(dto.Password == null || string.IsNullOrWhiteSpace(dto.Password))
            {
                return OperationResult<LoginResponseDto>.Failure("Please Enter Password");
            }
            // Regular expression for email validation
            // This regex is a common and reasonably robust one for email format.
            string emailRegex = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
            if (!Regex.IsMatch(dto.Email, emailRegex))
            {
                return OperationResult<LoginResponseDto>.Failure("Please enter a valid email address.");
            }
            if (dto == null || string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
            {
                // If fields miss throws an Error message
                return OperationResult<LoginResponseDto>.Failure("Invalid login credentials");
            }
            var user = await _employeeRepository.GetEmployeeDetailsByEmail(dto.Email);
            var login = user.Data;
            if (login == null)
            {
                return OperationResult<LoginResponseDto>.Failure("Invalid User");
            }

            var verifiedPassword = BCrypt.Net.BCrypt.Verify(dto.Password.Trim(), login.Password);
            if(!verifiedPassword)
            {
                _logger.LogWarning("Invalid password attempt for employee with email: {Email}", dto.Email);
                return OperationResult<LoginResponseDto>.Failure("Invalid login credentials");
            }
            var EmployeeId = login.EmployeeId;
            var EmployeeRole = login.Role;

            int? id = null;
            if(EmployeeRole == Roles.Manager)
            {
                var response = await _employeeRepository.GetEmployeeProfileAsync(EmployeeId);
                if(!response.IsSuccess || response.Data == null || response.Data.Count == 0)
                {
                    return OperationResult<LoginResponseDto>.Failure("Employee profile not found");
                }
                id = response.Data.FirstOrDefault()?.ManagerId;
            }
            else
            {
                var response = await _employeeRepository.GetEmployeeProfileAsync(EmployeeId);
                if(!response.IsSuccess || response.Data == null || response.Data.Count == 0)
                {
                    return OperationResult<LoginResponseDto>.Failure("Employee profile not found");
                }
                id = response.Data.FirstOrDefault()?.EmployeeId;
            }
            var jwtToken = _tokenService.GenerateToken(EmployeeId, EmployeeRole,id);
            var log = new LoginResponseDto
            {
                Success = true,
                Role = EmployeeRole,
                Message = "Login successful",
                Token = jwtToken
            };

            _logger.LogInformation($"Employee {dto.Email} logged in successfully");
            // returns Login success message
            return OperationResult<LoginResponseDto>.Success(log);
        }
        public async Task<OperationResult<EmployeeListResponseDTO>> GetEmployeeDetailsByEmail(string email)
        {
            var user = await _employeeRepository.GetEmployeeDetailsByEmail(email);

            if (user == null)
            {
                _logger.LogInformation($"Employee details not found for email: {email}"); // Using the logger as per previous context
                return OperationResult<EmployeeListResponseDTO>.Failure("No employee found with the provided email.");
            }
            else
            {
                var employeeDto = _mapper.Map<EmployeeListResponseDTO>(user);
                _logger.LogInformation($"Employee details retrieved and mapped successfully for email: {email}");
                return OperationResult<EmployeeListResponseDTO>.Success(employeeDto);
            }
        }

        public async Task<OperationResult<ICollection<EmployeeListResponseDTO>>> GetAbsentEmployeesListAsync()
        {
            _logger.LogInformation($"GetAbsentEmployeesListAsync Service Started at {DateTime.Now}");
            // Employee Authentication
            int? managerId = _tokenService.GetUserIdFromCurrentRequest();
            if (managerId == null)
            {
                // If not Employee throws Unauthorised Exception
                return OperationResult<ICollection<EmployeeListResponseDTO>>.Failure("Authentication failed");
            }
            // fetching current day employees working under a manager
            var employees = await _employeeRepository.GetAbsentEmployeesListAsync((int)managerId);
            // Storing data in an List named result
            List<EmployeeListResponseDTO> result = new List<EmployeeListResponseDTO>();
            if (!employees.IsSuccess)
            {
                return OperationResult<ICollection<EmployeeListResponseDTO>>.Failure(employees.Message);
            }
            result = _mapper.Map<List<EmployeeListResponseDTO>>(employees.Data);
            _logger.LogInformation($"GetAbsentEmployeesListAsync Service Completed at {DateTime.Now}");
            // returning the result List
            return OperationResult<ICollection<EmployeeListResponseDTO>>.Success(result);
        }
        public OperationResult<string> GetRoleService()
        {
            var role = _tokenService.GetRoleFromCurrentRequest();
            if(role == null)
            {
                return OperationResult<string>.Failure("Please login");
            }
            return OperationResult<string>.Success(role);
        }
    }
}