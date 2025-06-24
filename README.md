# Leave and Attendance Management System

## Features

### Employee Attendance Module
Enables employees to mark attendance, view history, and track clock-in/out times. Provides managers with an attendance monitoring dashboard.

### Leave Management Module
Allows employees to request and track various leave types. Provides managers with a system to approve or reject requests.

### Leave Balance Module
Automatically tracks and updates employee leave balances based on leave type and company policies, adjusting upon approval or rejection.

### Shift Management Module
Facilitates the assignment and update of employee shifts based on scheduling needs.
__
### Holiday Calendar Module
Manages company-wide and public holidays, making them visible to all employees. Prevents leave conflicts and aids accurate working hour calculations.

### Shift Swap Management Module
Allows employees to view assigned shifts and request swaps, subject to manager approval.

### Reports
Generates reports on attendance trends, leave usage, and shift coverage. Provides insights into workforce availability and patterns.

---

## Frontend Technologies
1. **Angular(JavaScript FrameWork)** : For creating the interactive user interface.
## Backend Technologies
1. **ASP.NET Core** : Backend framework for building REST APIs and handling business logic.
2. **MS SQL Server** : Relational database for storing employee, attendance, leave, and shift data. 
3.  **REST APIs** : For communication between the Angular frontend and the ASP.NET Core backend. 
4. **CORS** : Middleware for enabling cross-origin requests between frontend and backend.
5. **JWT** : For secure user authentication.
6. **bcryptjs** : For password hashing.
7. **EF-Core** : ORM(Object Relational Mapper) for make communication between Backend and Database.


---
## Sample users injected using EF-Core(**Code First Approach**)
```bash
**Emails and Passwords**

Employee Id - 1
Role: Manager
FirstName : John
LastName : Doe
Email : john.doe@example.com
Plain Password : password1 
Hashed Password : $2a$12$Ks6Z3pOlqY2D2YsQnelEa.QcBQ8vO3hfbTrVdJ2hzUAgiITOSiZNG
--------------------------------------------------------------------------

Employee Id - 2
Role: Manager
FirstName : jane
LastName : smith
Email : jane.smith@example.com
Plain Password : password2
Hashed Password : $2a$12$x9bx51R8hNIu9QKRxjoc4u.Rnb95i6XopRBvGZKmOh8Gos.MB8diq
--------------------------------------------------------------------------

Employee Id - 3
Role: Developer
Manager: 1
FirstName : alice
LastName : johnson
Email : alice.johnson@example.com
Plain Password : password3
Hashed Password : $2a$12$ZcMzFVHN2o8NeHt2kFie9O2XC3ifKvKKiIQID0Q9QF6dWb1XHXWAq
--------------------------------------------------------------------------

Employee Id - 4
Role: Tester
Manager: 1
FirstName : bob
LastName : brown
Email : bob.brown@example.com
Plain Password : password4
Hashed Password : $2a$12$Jlvk0ZipMyod0hWbHdwTj.a.LXAoSLHLYK8ks6cqRAP2x9B41QWD2
--------------------------------------------------------------------------

Employee Id - 5
Role: Developer
Manager: 1
FirstName : charlie
LastName : davis
Email : charlie.davis@example.com
Plain Password : password5
Hashed Password : $2a$12$ocLkjPrgrsxpcZP5lSB9Yu55vjnuB6upLMjc8IE3DmwApPktgxf0q
--------------------------------------------------------------------------

Employee Id - 6
Role: Tester
Manager: 2
FirstName : eve
LastName : wilson
Email : eve.wilson@example.com
Plain Password : password6
Hashed Password : $2a$12$eKPVuVVDN.mF6yiJCI7rJ.xygoO2or.bVYmeD3MMiQDu1F5afkjUq
--------------------------------------------------------------------------

Employee Id - 7
Role: Tester
Manager: 2
FirstName : alex
LastName : jones
Email : alex.jones@example.com
Plain Password : password7
Hashed Password : $2a$12$YLUO7lCFz8/xsMgFCVR/J.TYXqL.YwYw/IFMXSO/4Ejbp7fRy1bkm
--------------------------------------------------------------------------

Employee Id - 8
Role: Developer
Manager: 2
FirstName : maria
LastName : lopez
Email : maria.lopez@example.com
Plain Password : password8
Hashed Password : $2a$12$ymo5uMDo/cUXDDj7yD6qDez5obz.gzuaklWRCHeJB6.Z3hHhWv2sy
--------------------------------------------------------------------------

Employee Id - 9
Role: DevOps Engineer
Manager: 2
FirstName : jack
LastName : lol
Email : jack.lol@example.com
Plain Password : password9
Hashed Password : $2a$12$PpI5NzInKWfO3urdDcWHeO2.JogX5UWZGlC85Dyc7hgx/nE6wnpzG
--------------------------------------------------------------------------

Employee Id - 10
Role: Network Engineer
Manager: 2
FirstName : elon
LastName : mask
Email : elon.mask@example.com
Plain Password : password10
Hashed Password : $2a$12$iXteU/cK5cKZLYljSTM1We9D5ogfsnuvzxegm8sEA16zOm9vSApNO
--------------------------------------------------------------------------

Employee Id - 11
Role: Tester
Manager: 1
FirstName : jan
LastName : doe
Email : jan.doe@example.com
Plain Password : password11
Hashed Password : $2a$10$vqkRzhNjtniw3CCpsoet8uxGXxWanZwek.LrKQCyAQLVvkIOkQJO2
```

## Code Snippet to generate Hashed Passwords using Bcrypt

```bash
## hashPassword -- This function takes a password as input and returns a hashed version of it using bcrypt.
Bcrypt.hashPassword ("password1",10) -- returns $2a$12$Ks6Z3pOlqY2D2YsQnelEa.QcBQ8vO3hfbTrVdJ2hzUAgiITOSiZNG

## decryptPassword -- This function takes a password and a hashed password as input and returns true if the password matches the hash, otherwise false.
Bcrypt.Verify ("password1", "$2a$12$Ks6Z3pOlqY2D2YsQnelEa.QcBQ8vO3hfbTrVdJ2hzUAgiITOSiZNG") -- returns true / fasle (testing purpose).
```

## Backend  Structure
```bash

LeaveManagement/                                   // Root folder for the Leave Management .NET Core project.
├── Connected Services/                            // Placeholder for any connected services (e.g., WCF, gRPC clients).
├── Dependencies/                                  // Manages project dependencies (e.g., NuGet packages).
├── Properties/                                    // Project-level properties and settings.
│   └── launchSettings.bash                        // Configuration for launching the application in different environments (e.g., IIS Express, Kestrel).
├── Application/                                   // Contains application-specific logic, DTOs, interfaces, and services.
│   ├── Dtos/                                      // Data Transfer Objects: used for transferring data between layers, often for API requests/responses.
│   │   ├── AssignShiftsDTO.cs                     // DTO for assigning new shifts to employees.
│   │   ├── AttendenceResponseDTO.cs               // DTO for attendance details in a response.
│   │   ├── EmployeeAttendanceResponseDTO.cs       // DTO for an employee's attendance history in a response.
│   │   ├── EmployeeListResponseDTO.cs             // DTO for a list of employees in a response.
│   │   ├── HolidayCalendarResponseDTO.cs          // DTO for holiday calendar details in a response.
│   │   ├── LeaveBalanceResponseDTO.cs             // DTO for leave balance information in a response.
│   │   ├── LeaveRequestStatusResponseDTO.cs       // DTO for the status of a leave request in a response.
│   │   ├── LoginDTO.cs                            // DTO for user login credentials (request).
│   │   ├── LoginResponseDto.cs                    // DTO for login response, typically containing a token.
│   │   ├── PostLeaveRequestDTO.cs                 // DTO for creating a new leave request (request).
│   │   ├── PostShiftSwapRequestDTO.cs             // DTO for creating a new shift swap request (request).
│   │   ├── ReportResponseDto.cs                   // DTO for report data in a response.
│   │   ├── ShiftsResponseDTO.cs                   // DTO for shift details in a response.
│   │   ├── ShiftSwapRequestResponseDTO.cs         // DTO for shift swap request details in a response.
│   │   ├── UpdateLeaveRequestDTO.cs               // DTO for updating an existing leave request (request).
│   │   ├── UpdateShiftAssignDTO.cs                // DTO for updating an assigned shift (request).
│   │   └── UpdateSwapShiftDTO.cs                  // DTO for updating a shift swap request (request).
│   ├── Interfaces/                                // Defines contracts for application services.
│   │   ├── IAttendanceService.cs                  // Interface for attendance-related business logic.
│   │   ├── IEmployeeService.cs                    // Interface for employee-related business logic.
│   │   ├── IHolidayCalendarService.cs             // Interface for holiday calendar business logic.
│   │   ├── ILeaveBalanceService.cs                // Interface for leave balance business logic.
│   │   ├── ILeaveRequestService.cs                // Interface for leave request business logic.
│   │   ├── IReportsService.cs                     // Interface for report generation business logic.
│   │   ├── IShiftsService.cs                      // Interface for shift management business logic.
│   │   ├── IShiftSwapRequestService.cs            // Interface for shift swap request business logic.
│   │   └── ITokenService.cs                       // Interface for token generation and validation.
│   ├── Middlewares/                               // Custom middleware for handling requests/responses (e.g., error handling).
│   │   └── ExceptionMiddleware.cs                 // Middleware for catching and handling exceptions globally.
│   ├── Profiles/                                  // AutoMapper profiles for mapping between DTOs and domain models.
│   │   ├── AssignShiftProfile.cs                  // AutoMapper profile for AssignShiftsDTO.
│   │   ├── AttendanceProfile.cs                   // AutoMapper profile for Attendance models and DTOs.
│   │   ├── EmployeeProfile.cs                     // AutoMapper profile for Employee models and DTOs.
│   │   ├── HolidayCalendarProfile.cs              // AutoMapper profile for HolidayCalendar models and DTOs.
│   │   ├── LeaveBalanceProfile.cs                 // AutoMapper profile for LeaveBalance models and DTOs.
│   │   ├── LeaveRequestProfile.cs                 // AutoMapper profile for LeaveRequest models and DTOs.
│   │   ├── LoginProfile.cs                        // AutoMapper profile for LoginDTO and LoginResponseDto.
│   │   ├── PostLeaveRequestProfile.cs             // AutoMapper profile for PostLeaveRequestDTO.
│   │   ├── PostShiftSwapRequestProfile.cs         // AutoMapper profile for PostShiftSwapRequestDTO.
│   │   ├── ShiftProfile.cs                        // AutoMapper profile for Shifts models and DTOs.
│   │   ├── ShiftSwapRequestProfile.cs             // AutoMapper profile for ShiftSwapRequest models and DTOs.
│   │   ├── UpdateLeaveRequestProfile.cs           // AutoMapper profile for UpdateLeaveRequestDTO.
│   │   ├── UpdateShiftAssignProfile.cs            // AutoMapper profile for UpdateShiftAssignDTO.
│   │   └── UpdateSwapShiftProfile.cs              // AutoMapper profile for UpdateSwapShiftDTO.
│   ├── Services/                                  // Concrete implementations of application service interfaces.
│   │   ├── AttendanceService.cs                   // Implementation of IAttendanceService.
│   │   ├── EmployeeService.cs                     // Implementation of IEmployeeService.
│   │   ├── HolidayCalendarService.cs              // Implementation of IHolidayCalendarService.
│   │   ├── LeaveBalanceService.cs                 // Implementation of ILeaveBalanceService.
│   │   ├── LeaveRequestService.cs                 // Implementation of ILeaveRequestService.
│   │   ├── ReportsService.cs                      // Implementation of IReportsService.
│   │   ├── ShiftsService.cs                       // Implementation of IShiftsService.
│   │   ├── ShiftSwapRequestService.cs             // Implementation of IShiftSwapRequestService.
│   │   └── TokenService.cs                        // Implementation of ITokenService.
│   └── Utls/                                      // Utility classes used across the application layer.
│       └── JwtHelper.cs                           // Helper class for bash Web Token (JWT) operations.
├── Controllers/                                   // API controllers handling HTTP requests and responses.
│   ├── AttendanceControllers.cs                   // Handles API endpoints related to employee attendance.
│   ├── EmployeeControllers.cs                     // Handles API endpoints related to employee management.
│   ├── HolidayCalendarControllers.cs              // Handles API endpoints related to the holiday calendar.
│   ├── LeaveRequestControllers.cs                 // Handles API endpoints related to leave requests.
│   ├── LeaveBalanceControllers.cs                 // Handles API endpoints related to leave balances.
│   ├── ReportControllers.cs                       // Handles API endpoints related to generating reports.
│   ├── ShiftsControllers.cs                       // Handles API endpoints related to shift management.
│   └── ShiftSwapRequestControllers.cs             // Handles API endpoints related to shift swap requests.
├── Domain/                                        // Contains core business entities and domain interfaces.
│   ├── Interfaces/                                // Defines contracts for domain repositories.
│   │   ├── IAttendanceRepository.cs               // Interface for data access operations for Attendance.
│   │   ├── IEmployeeRepository.cs                 // Interface for data access operations for Employee.
│   │   ├── IHolidayCalendarRepository.cs          // Interface for data access operations for HolidayCalendar.
│   │   ├── ILeaveBalanceRepository.cs             // Interface for data access operations for LeaveBalance.
│   │   ├── ILeaveRequestRepository.cs             // Interface for data access operations for LeaveRequest.
│   │   ├── IReportsRepository.cs                  // Interface for data access operations for Reports.
│   │   ├── IShiftsRepository.cs                   // Interface for data access operations for Shifts.
│   │   └── IShiftSwapRequestRepository.cs         // Interface for data access operations for ShiftSwapRequest.
│   └── Models/                                    // Defines core business entities (POCOs) representing database tables.
│       ├── Attendance.cs                          // Entity model for employee attendance records.
│       ├── Employee.cs                            // Entity model for employee details.
│       ├── HolidayCalendar.cs                     // Entity model for holiday calendar entries.
│       ├── LeaveBalance.cs                        // Entity model for employee leave balances.
│       ├── LeaveRequest.cs                        // Entity model for employee leave requests.
│       ├── Shifts.cs                              // Entity model for assigned shifts.
│       └── ShiftSwapRequest.cs                    // Entity model for employee shift swap requests.
├── Infrastructure/                                // Handles data access, external services, and infrastructure concerns.
│   ├── Persistence/                               // Contains database context and repository implementations.
│   │   ├── Configurations/                        // Entity Framework Core fluent API configurations for models.
│   │   │   ├── AttendanceConfiguration.cs         // EF Core configuration for the Attendance entity.
│   │   │   ├── EmployeeConfiguration.cs           // EF Core configuration for the Employee entity.
│   │   │   ├── HolidayCalendarConfiguration.cs    // EF Core configuration for the HolidayCalendar entity.
│   │   │   ├── LeaveBalanceConfiguration.cs       // EF Core configuration for the LeaveBalance entity.
│   │   │   ├── LeaveRequestConfiguration.cs       // EF Core configuration for the LeaveRequest entity.
│   │   │   ├── ShiftsConfiguration.cs             // EF Core configuration for the Shifts entity.
│   │   │   └── ShiftSwapRequestConfiguration.cs   // EF Core configuration for the ShiftSwapRequest entity.
│   │   ├── Repositories/                          // Concrete implementations of domain repository interfaces.
│   │   │   ├── AttendanceRepository.cs            // Implementation of IAttendanceRepository.
│   │   │   ├── EmployeeRepository.cs              // Implementation of IEmployeeRepository.
│   │   │   ├── HolidayCalendarRepository.cs       // Implementation of IHolidayCalendarRepository.
│   │   │   ├── LeaveBalanceRepository.cs          // Implementation of ILeaveBalanceRepository.
│   │   │   ├── LeaveRequestRepository.cs          // Implementation of ILeaveRequestRepository.
│   │   │   ├── ReportsRepository.cs               // Implementation of IReportsRepository.
│   │   │   ├── ShiftsRepository.cs                // Implementation of IShiftsRepository.
│   │   │   └── ShiftSwapRequestRepository.cs      // Implementation of IShiftSwapRequestRepository.
│   │   └── LeaveDbContext.cs                      // Entity Framework Core DbContext for database interaction.
│   ├── DependencyInjection.cs                     // Extension method for registering infrastructure services in the DI container.
│   └── InfraStructureSerciceCollectionExtension.cs// (Likely a typo for InfrastructureServiceCollectionExtension.cs) Extension method to register infrastructure services.
├── Logs/                                          // Folder for application log files.
│   └── LeaveManagementLog20250611.txt             // Example log file for June 11, 2025.
│   └── ...etc...                                  // Other log files.
├── Migrations/                                    // Entity Framework Core database migration files.
│   ├── FirstMigration.cs                          // First database migration script.
│   ├── SecondMigration.cs                         // Second database migration script.
│   └── ...etc...                                  // Other migration scripts.
├── Shared/                                        // Common utilities or shared models/enums.
│   ├── OperationResult.cs                         // Represents the result of an operation (e.g., success/failure, data, messages).
│   └── Roles.cs                                   // Defines application roles (e.g., Manager, Developer, Tester).
├── appSettings.bash                               // Application configuration settings (e.g., database connection strings, JWT settings).
├── GlobalUsings.cs                                // Centralized file for global using directives in C#.
├── LeaveManagement.http                           // HTTP file for testing API endpoints (e.g., in VS Code REST Client).
└── Program.cs                                     // Entry point of the .NET Core application, sets up the web host.

```
## Frontend  Structure
```bash
LeaveManagement/                                   // Root folder for the Angular frontend project.
├── .angular/                                      // Angular-specific configuration and build artifacts.
├── node_modules/                                  // Directory containing all project dependencies installed by npm.
├── public/                                        // Assets publicly accessible by the application.
│   └── COG Logo.jpg                               // Company logo image file.
├── src/                                           // Source code for the Angular application.
│   ├── app/                                       // Contains the main application logic, components, and modules.
│   │   ├── core/                                  // Core application services, guards, and interceptors.
│   │   │   ├── guards/                            // Angular route guards to protect routes.
│   │   │   │   ├── employee-auth.guards.ts        // Guard for protecting employee-specific routes.
│   │   │   │   └── manager-auth.guards.ts         // Guard for protecting manager-specific routes.
│   │   │   └── interceptors/                      // Angular HTTP interceptors for modifying requests/responses.
│   │   │       └── auth-expired.interceptor.ts    // Interceptor to handle expired authentication tokens.
│   │   ├── features/                              // Contains feature-specific modules and components.
│   │   │   ├── Attendance/                        // Feature module for attendance management.
│   │   │   │   ├── Dtos/                          // Data Transfer Objects specific to the Attendance feature.
│   │   │   │   │   ├── AttendanceResponseDto.ts   // DTO for attendance details in a response.
│   │   │   │   │   └── EmployeeAttendanceResponseDto.ts // DTO for an employee's attendance history in a response.
│   │   │   │   └── attendance.service.ts          // Service for handling attendance-related API calls and logic.
│   │   │   ├── Auth/                              // Feature module for authentication and authorization.
│   │   │   │   ├── Dtos/                          // Data Transfer Objects specific to the Auth feature.
│   │   │   │   │   ├── login-payload.dto.ts       // DTO for login request payload.
│   │   │   │   │   └── LoginResponseDTO.ts        // DTO for login response, typically containing a token.
│   │   │   │   ├── login/                         // Component for user login.
│   │   │   │   │   ├── login.component.ts         // TypeScript logic for the login component.
│   │   │   │   │   ├── login.component.html       // HTML template for the login component.
│   │   │   │   │   └── login.component.css        // CSS styles for the login component.
│   │   │   │   └── auth.login.service.ts          // Service for handling authentication and login API calls.
│   │   │   ├── Employee/                          // Feature module for employee management.
│   │   │   │   ├── Dtos/                          // Data Transfer Objects specific to the Employee feature.
│   │   │   │   │   └── EmployeeListResponse-payload.dto.ts // DTO for employee list response payload.
│   │   │   │   └── employee.service.ts            // Service for handling employee-related API calls and logic.
│   │   │   ├── HolidayCalendar/                   // Feature module for holiday calendar management.
│   │   │   │   ├── Dtos/                          // Data Transfer Objects specific to the Holiday Calendar feature.
│   │   │   │   │   └── HolidayResponse.dto.ts     // DTO for holiday details in a response.
│   │   │   │   └── holiday-calendar.service.ts    // Service for handling holiday calendar API calls and logic.
│   │   │   ├── LeaveBalance/                      // Feature module for leave balance management.
│   │   │   │   ├── Dtos/                          // Data Transfer Objects specific to the Leave Balance feature.
│   │   │   │   │   └── LeaveBalanceResponse.dto   // DTO for leave balance information in a response.
│   │   │   │   └── leave-balance.service.ts       // Service for handling leave balance API calls and logic.
│   │   │   ├── LeaveRequest/                      // Feature module for leave request management.
│   │   │   │   ├── Dtos/                          // Data Transfer Objects specific to the Leave Request feature.
│   │   │   │   │   ├── LeaveRequestStatusResponseDto // DTO for the status of a leave request in a response.
│   │   │   │   │   ├── PostLeaveRequestDto.ts     // DTO for creating a new leave request (request).
│   │   │   │   │   └── UpdateLeaveRequestDto.ts   // DTO for updating an existing leave request (request).
│   │   │   │   └── leave-request.service.ts       // Service for handling leave request API calls and logic.
│   │   │   ├── Reports/                           // Feature module for generating reports.
│   │   │   │   ├── Dtos/                          // Data Transfer Objects specific to the Reports feature.
│   │   │   │   │   └── ReportResponseDto.ts       // DTO for report data in a response.
│   │   │   │   └── report.service.ts              // Service for handling report API calls and logic.
│   │   │   ├── Shifts/                            // Feature module for shift management.
│   │   │   │   ├── Dtos/                          // Data Transfer Objects specific to the Shifts feature.
│   │   │   │   │   ├── AssignShiftRequestDto.ts   // DTO for assigning new shifts to employees.
│   │   │   │   │   ├── EmployeeShiftResponseDto.ts// DTO for an employee's shift details in a response.
│   │   │   │   │   └── UpdateShiftAssignDto.ts    // DTO for updating an assigned shift (request).
│   │   │   │   └── shifts.service.ts              // Service for handling shift management API calls and logic.
│   │   │   ├── ShiftSwapRequest/                  // Feature module for shift swap request management.
│   │   │   │   ├── Dtos/                          // Data Transfer Objects specific to the Shift Swap Request feature.
│   │   │   │   │   ├── PostShiftSwapRequestDto.ts // DTO for creating a new shift swap request (request).
│   │   │   │   │   ├── ShiftSwapRequestResponseDto.ts // DTO for shift swap request details in a response.
│   │   │   │   │   └── UpdateShiftSwapRequestDto.ts // DTO for updating a shift swap request (request).
│   │   │   │   └── shift-swap-request.service.ts  // Service for handling shift swap request API calls and logic.
│   │   │   ├── about/                             // Component for displaying "About" information.
│   │   │   │   ├── about.component.ts             // TypeScript logic for the about component.
│   │   │   │   ├── about.component.html           // HTML template for the about component.
│   │   │   │   └── about.component.css            // CSS styles for the about component.
│   │   │   ├── annual-calendar/                   // Component for displaying the annual calendar.
│   │   │   │   ├── annual-calendar.component.ts   // TypeScript logic for the annual calendar component.
│   │   │   │   ├── annual-calendar.component.html // HTML template for the annual calendar component.
│   │   │   │   └── annual-calendar.component.css  // CSS styles for the annual calendar component.
│   │   │   ├── employee-attendance-report/        // Component for displaying employee attendance reports.
│   │   │   │   ├── employee-attendance-report.component.ts // TypeScript logic for the employee attendance report component.
│   │   │   │   ├── employee-attendance-report.component.html // HTML template for the employee attendance report component.
│   │   │   │   └── employee-attendance-report.component.css // CSS styles for the employee attendance report component.
│   │   │   ├── employee-dashboard/                // Dashboard components specific to employees.
│   │   │   │   ├── attendance/                    // Component for employee attendance on dashboard.
│   │   │   │   │   ├── attendance.component.ts    // TypeScript logic for the employee dashboard attendance component.
│   │   │   │   │   ├── attendance.component.html  // HTML template for the employee dashboard attendance component.
│   │   │   │   │   └── attendance.component.css   // CSS styles for the employee dashboard attendance component.
│   │   │   │   ├── holiday-calendar/              // Component for holiday calendar on employee dashboard.
│   │   │   │   │   ├── holiday-calendar.component.ts // TypeScript logic for the employee dashboard holiday calendar component.
│   │   │   │   │   ├── holiday-calendar.component.html // HTML template for the employee dashboard holiday calendar component.
│   │   │   │   │   └── holiday-calendar.component.css // CSS styles for the employee dashboard holiday calendar component.
│   │   │   │   └── today-attendance/              // Component for today's attendance on employee dashboard.
│   │   │   │       ├── today-attendance.component.ts // TypeScript logic for the employee dashboard today attendance component.
│   │   │   │       ├── today-attendance.component.html // HTML template for the employee dashboard today attendance component.
│   │   │   │       └── today-attendance.component.css // CSS styles for the employee dashboard today attendance component.
│   │   │   ├── employee-leave-request/            // Component for employees to submit leave requests.
│   │   │   │   ├── employee-leave-request.component.ts // TypeScript logic for the employee leave request component.
│   │   │   │   ├── employee-leave-request.component.html // HTML template for the employee leave request component.
│   │   │   │   └── employee-leave-request.component.css // CSS styles for the employee leave request component.
│   │   │   ├── employee-leave-request-status/     // Component for employees to view leave request status.
│   │   │   │   ├── employee-leave-request-status.component.ts // TypeScript logic for the employee leave request status component.
│   │   │   │   ├── employee-leave-request-status.component.html // HTML template for the employee leave request status component.
│   │   │   │   └── employee-leave-request-status.component.css // CSS styles for the employee leave request status component.
│   │   │   ├── employee-shift-swap/               // Component for employees to request shift swaps.
│   │   │   │   ├── employee-shift-swap.component.ts // TypeScript logic for the employee shift swap component.
│   │   │   │   ├── employee-shift-swap.component.html // HTML template for the employee shift swap component.
│   │   │   │   └── employee-shift-swap.component.css // CSS styles for the employee shift swap component.
│   │   │   ├── employee-shifts/                   // Component for employees to view their assigned shifts.
│   │   │   │   ├── employee-shifts.component.ts   // TypeScript logic for the employee shifts component.
│   │   │   │   ├── employee-shifts.component.html // HTML template for the employee shifts component.
│   │   │   │   └── employee-shifts.component.css  // CSS styles for the employee shifts component.
│   │   │   ├── error-page/                        // Component for displaying error messages.
│   │   │   │   ├── error-page.component.ts        // TypeScript logic for the error page component.
│   │   │   │   ├── error-page.component.html      // HTML template for the error page component.
│   │   │   │   └── error-page.component.css       // CSS styles for the error page component.
│   │   │   ├── leave-balance/                     // Component for displaying employee leave balances.
│   │   │   │   ├── leave-balance.component.ts     // TypeScript logic for the leave balance component.
│   │   │   │   ├── leave-balance.component.html   // HTML template for the leave balance component.
│   │   │   │   └── leave-balance.component.css    // CSS styles for the leave balance component.
│   │   │   ├── manager-absent-employees/          // Component for managers to view absent employees.
│   │   │   │   ├── manager-absent-employees.component.ts // TypeScript logic for the manager absent employees component.
│   │   │   │   ├── manager-absent-employees.component.html // HTML template for the manager absent employees component.
│   │   │   │   └── manager-absent-employees.component.css // CSS styles for the manager absent employees component.
│   │   │   ├── manager-attendance-report/         // Component for managers to view attendance reports.
│   │   │   │   ├── manager-attendance-report.component.ts // TypeScript logic for the manager attendance report component.
│   │   │   │   ├── manager-attendance-report.component.html // HTML template for the manager attendance report component.
│   │   │   │   └── manager-attendance-report.component.css // CSS styles for the manager attendance report component.
│   │   │   ├── manager-dashboard/                 // Dashboard components specific to managers.
│   │   │   │   ├── managers-report/               // Component for manager's reports on dashboard.
│   │   │   │   │   ├── managers-report.component.ts // TypeScript logic for the manager's report component.
│   │   │   │   │   ├── managers-report.component.html // HTML template for the manager's report component.
│   │   │   │   │   └── managers-report.component.css // CSS styles for the manager's report component.
│   │   │   │   └── present-employees/             // Component for displaying present employees on manager dashboard.
│   │   │   │       ├── present-employees.component.ts // TypeScript logic for the present employees component.
│   │   │   │       ├── present-employees.component.html // HTML template for the present employees component.
│   │   │   │       └── present-employees.component.css // CSS styles for the present employees component.
│   │   │   ├── manager-employees/                 // Component for managers to manage employee details.
│   │   │   │   ├── manager-employees.component.ts // TypeScript logic for the manager employees component.
│   │   │   │   ├── manager-employees.component.html // HTML template for the manager employees component.
│   │   │   │   └── manager-employees.component.css // CSS styles for the manager employees component.
│   │   │   ├── manager-leave-request/             // Component for managers to handle leave requests.
│   │   │   │   ├── manager-leave-request.component.ts // TypeScript logic for the manager leave request component.
│   │   │   │   ├── manager-leave-request.component.html // HTML template for the manager leave request component.
│   │   │   │   └── manager-leave-request.component.css // CSS styles for the manager leave request component.
│   │   │   ├── manager-shift-assign/              // Component for managers to assign shifts.
│   │   │   │   ├── manager-shift-assign.component.ts // TypeScript logic for the manager shift assign component.
│   │   │   │   ├── manager-shift-assign.component.html // HTML template for the manager shift assign component.
│   │   │   │   └── manager-shift-assign.component.css // CSS styles for the manager shift assign component.
│   │   │   ├── manager-shift-swap/                // Component for managers to handle shift swap requests.
│   │   │   │   ├── manager-shift-swap.component.ts // TypeScript logic for the manager shift swap component.
│   │   │   │   ├── manager-shift-swap.component.html // HTML template for the manager shift swap component.
│   │   │   │   └── manager-shift-swap.component.css // CSS styles for the manager shift swap component.
│   │   │   └── manager-shifts/                    // Component for managers to view and manage shifts.
│   │   │       ├── manager-shifts.component.ts    // TypeScript logic for the manager shifts component.
│   │   │       ├── manager-shifts.component.html  // HTML template for the manager shifts component.
│   │   │       └── manager-shifts.component.css   // CSS styles for the manager shifts component.
│   │   ├── routes/                                // Defines application routes (if separated from app.routes.ts).
│   │   ├── shared/                                // Reusable components, directives, and pipes used across features.
│   │   │   ├── employee-navbar/                   // Component for the employee navigation bar.
│   │   │   │   ├── employee-navbar.component.html // HTML template for the employee navbar component.
│   │   │   │   ├── employee-navbar.component.css  // CSS styles for the employee navbar component.
│   │   │   │   └── employee-navbar.component.ts   // TypeScript logic for the employee navbar component.
│   │   │   ├── employee-profile-modal/            // Component for the employee profile modal.
│   │   │   │   ├── employee-profile-modal.component.html // HTML template for the employee profile modal component.
│   │   │   │   ├── employee-profile-modal.component.css  // CSS styles for the employee profile modal component.
│   │   │   │   └── employee-profile-modal.component.ts   // TypeScript logic for the employee profile modal component.
│   │   │   ├── manager-navbar/                    // Component for the manager navigation bar.
│   │   │   │   ├── manager-navbar.component.html  // HTML template for the manager navbar component.
│   │   │   │   ├── manager-navbar.component.css   // CSS styles for the manager navbar component.
│   │   │   │   └── manager-navbar.component.ts    // TypeScript logic for the manager navbar component.
│   │   │   └── popup/                             // Component for general-purpose pop-up messages or dialogs.
│   │   │       ├── popup.component.html           // HTML template for the popup component.
│   │   │       ├── popup.component.css            // CSS styles for the popup component.
│   │   │       └── popup.component.ts             // TypeScript logic for the popup component.
│   │   ├── app.component.css                      // Root component specific CSS styles.
│   │   ├── app.component.html                     // Root component HTML template.
│   │   ├── app.component.spec.ts                  // Unit tests for the root component.
│   │   ├── app.component.ts                       // Root component TypeScript logic.
│   │   ├── app.config.ts                          // Application-wide configuration for standalone components.
│   │   └── app.routes.ts                          // Defines the main application routes.
│   ├── environments/                              // Configuration files for different environments (e.g., development, production).
│   │   └── environment.development.ts             // Environment-specific variables for development mode.
│   ├── styles/                                    // Global styles for the application.
│   │   └── toastr-custom.css                      // Custom CSS styles for Toastr notifications.
│   ├── index.html                                 // Main HTML file that serves as the entry point for the Angular application.
│   ├── main.ts                                    // Entry point for the Angular application, bootstraps the root module.
│   └── style.css                                  // Global CSS styles applied to the entire application.
├── .editorconfig                                  // Configuration for consistent coding styles across different editors.
├── .gitignore                                     // Specifies intentionally untracked files to ignore by Git.
├── angular.bash                                   // Angular CLI configuration file for project settings.
├── package-lock.bash                              // Records the exact versions of dependencies used in the project.
├── package.bash                                   // Project metadata and script definitions, lists dependencies.
├── tsconfig.app.bash                              // TypeScript configuration specific to the application compilation.
├── tsconfig.bash                                  // Base TypeScript configuration for the project.
└── tsconfig.spec.bash                             // TypeScript configuration specific to test compilation.

```

## Installation and Setup
### Frontend Setup

Navigate to the frontend directory:

```bash
cd LeaveManagement
```
```bash
npm install
```
```bash
npm install
```
### Backend Setup
Navigate to the backend directory:

```bash
cd LeaveManagement
```
```bash
dotnet restore
```
```bash
dotnet build
```
```bash
dotnet run
```

## Frontend Features

- Login Page
    - Allows users to log in using their credentials(email and password).
    - Upon successful login, stores the JWT token in cookies for authentication.
    - Redirects to the Dashboard based upon User Role after successful login.

### Through Navigation bar empolyee can navigate to all screens
## Employee Dashboard 
    - Home Page
        - Employee can check Week progress for their Attendance in progress bars.
        - Employee can check upcoming five holidays list.
        - Employee able to mark Clock-In and Clock-Out Attendance.
    - Attendance Page
        - Employee able to fetch their Attendance by Date Range.
    - Leave Page
        - Leave Request
            - Employee can apply Leave Request.
        - Leave Status
            - Employee can check leave Request Status.
    - Shifts Page
        - Assigned Shifts
            - Employee can check there Assigned Shifts. Apply swap request if needed.
            - Employee can check shift swap Request Status.
    - Leave Balance Page
        - Employee can check their leave balance.
    - Calendar Page
        - Employee can see Annual Calendar.
    - About Page
        - Employee can see About Organisation.
    - Profile
        - View Profile
            - Employee can view there Profile Details.
        - Logout
            - Employee can logout form the System.
## Manager Dashboard 
    - Home Page
        - Manager can see Today's present Employees List
        - Can able to see Reports. On click in each report button navigate to particular page
            - Absent Employees
                - Manager can see Absent Employees.
            - Pending Leaves
                - navigates to Leave Request page.
            - Pending Swaps
                - navigates to Swap Request page.
            - Total Employees
                - navigates to Employee page.
        - Employee can check upcoming five holidays list.
    - Employee Page
        - Manager can see Employees who reports to him.
    - Attendance Page
        - Manager able to fetch their Employee Attendance by Date Range.
    - Leave Request Page
        - Manager can see leave requests of there Employees.
    - Shifts
        - Assign Shifts
            - Manager can Assign Shifts to their Employees.
        - Assigned Shifts
            - Manager can see all Employees Assigned Shifts, he can able to modify.
        - Shift Swap Request
            - Manager can see all their Employees Shift Swap Requests.
    - Calendar Page
        - Employee can see Annual Calendar.
    - About Page
        - Employee can see About Organisation.
    - Profile
        - View Profile
            - Employee can view there Profile Details.
        - Logout
            - Employee can logout form the System.

## API Endpoints documentation is available by running the backend of the project (via Swagger Documentation)
#   L e a v e _ M a n a g e m e n t _ S y s t e m  
 