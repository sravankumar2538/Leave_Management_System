using LeaveManagement.Application.Services;
using LeaveManagement.Infrastructure.Persistence.Repositories;
using LeaveManagement.Application.Utls;

namespace LeaveManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddSingleton<JwtHelper>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IAttendanceService, AttendanceService>();
        services.AddScoped<IAttendanceRepository, AttendanceRepository>();
        services.AddScoped<ILeaveBalanceService, LeaveBalanceService>();
        services.AddScoped<ILeaveBalanceRepository, LeaveBalanceRepository>();
        services.AddScoped<IShiftsService, ShiftsService>();
        services.AddScoped<IShiftsRepository, ShiftsRepository>();
        services.AddScoped<ILeaveRequestService, LeaveRequestService>();
        services.AddScoped<ILeaveRequestRepository, LeaveRequestRepository>();
        services.AddScoped<IShiftSwapRequestService, ShiftSwapRequestService>();
        services.AddScoped<IShiftSwapRequestRepository, ShiftSwapRequestRepository>();
        services.AddScoped<IHolidayCalendarService, HolidayCalendarService>();
        services.AddScoped<IHolidayCalendarRepository, HolidayCalendarRepository>();
        services.AddScoped<IReportsService, ReportsService>();
        services.AddScoped<IReportsRepository, ReportsRepository>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddAutoMapper(typeof(Program));


        return services;
    }
}
