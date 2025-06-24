using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Persistence.Configurations;

public class AttendanceConfiguration : IEntityTypeConfiguration<Attendance>
{
    public void Configure(EntityTypeBuilder<Attendance> builder)
    {
        builder.HasKey(a => a.AttendanceId);

        builder.Property(a => a.EmployeeId)
            .IsRequired();

        builder.Property(e => e.FirstName)
           .IsRequired()
           .HasMaxLength(20);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(20);
        builder.Property(a => a.ClockInTime)
            .IsRequired();

        builder.Property(a => a.ClockOutTime)
            .IsRequired();

        builder.Property(a => a.WorkHours)
            .IsRequired();

        builder.Property(a => a.Percentage)
           .IsRequired();

        builder.Property(a => a.Date)
            .IsRequired();

        builder.Property(a => a.ClockIn)
            .IsRequired();

        builder.Property(a => a.ClockOut)
            .IsRequired();

        builder.HasOne(a => a.Employee)
            .WithMany(e => e.Attendances)
            .HasForeignKey(a => a.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
