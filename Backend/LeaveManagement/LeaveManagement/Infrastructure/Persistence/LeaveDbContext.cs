using LeaveManagement.Infrastructure.Persistence.Configurations;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Persistence;

public class LeaveDbContext : DbContext
{
    public LeaveDbContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<Employee> Employees { get; set; }
    public DbSet<Attendance> Attendances { get; set; }
    public DbSet<LeaveBalance> LeaveBalances { get; set; }
    public DbSet<LeaveRequest> LeaveRequests { get; set; }
    public DbSet<Shifts> Shifts { get; set; }
    public DbSet<ShiftSwapRequest> ShiftSwapRequests { get; set; }
    public DbSet<HolidayCalendar> HolidayCalendars { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(LeaveDbContext).Assembly);
    }
}
