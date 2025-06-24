using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Persistence.Repositories;

public class LeaveBalanceRepository : ILeaveBalanceRepository
{
    private readonly LeaveDbContext _context;
    private readonly IConfiguration _configuration;
    public LeaveBalanceRepository(LeaveDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }
   
    public async Task<OperationResult<ICollection<LeaveBalance>>> GetLeaveBalanceByEmployeeIdAsync(int employeeId)
    {
        // fetching current year April 1st date
        DateTime aprilFirst = new DateTime(DateTime.Now.Year, 4, 1);
        // converting from dateTime to dateOnly
        DateOnly yearStartDate = DateOnly.FromDateTime(aprilFirst);
        // checking the leavebalance present for an employee or not
        var check = await _context.LeaveBalances
            .Where(lb => lb.EmployeeId == employeeId && lb.Year == yearStartDate)
            .ToListAsync();

        // if not
        if (!check.Any())
        {
            // Adding LeaveBalance sheet for an employee
            var leaveBalance = await AddLeaveBalanceForEmployeeAsync(employeeId, yearStartDate);
            if (leaveBalance != null )
            {
                check.Add(leaveBalance);
            }
        }
        // returning result list
        return OperationResult<ICollection<LeaveBalance>>.Success(check);
    }
    public async Task<LeaveBalance> AddLeaveBalanceForEmployeeAsync(int employeeId, DateOnly yearStartDate)
    {
        // getting data from configuration file for leave types and leave count for an leaveType
        var leaveBalancesSettings = _configuration.GetSection("LeaveBalancesSettings").Get<Dictionary<string, int>>();
        if (leaveBalancesSettings == null)
        {
             throw new InvalidOperationException("LeaveBalancesSettings not found in configuration");
        }
        // checking the employeeId
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeId == employeeId);

        // Adding new leave balance sheet
        var leaveBalance = new LeaveBalance
        {
            EmployeeId = employeeId,
            FirstName = employee?.FirstName,
            LastName = employee?.LastName,
            Year = yearStartDate,
            Casual = leaveBalancesSettings.ContainsKey("Casual") ? leaveBalancesSettings["Casual"] : 0,
            Sick = leaveBalancesSettings.ContainsKey("Sick") ? leaveBalancesSettings["Sick"] : 0,
            Vacation = leaveBalancesSettings.ContainsKey("Vacation") ? leaveBalancesSettings["Vacation"] : 0,
            Medical = leaveBalancesSettings.ContainsKey("Medical") ? leaveBalancesSettings["Medical"] : 0
        };
        await _context.LeaveBalances.AddAsync(leaveBalance);
        await _context.SaveChangesAsync();
        // returning new leave balance sheet for an employee
        return (leaveBalance);
    }
   

    
}
