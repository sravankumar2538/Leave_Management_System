using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Persistence.Configurations;

public class LeaveRequestConfiguration : IEntityTypeConfiguration<LeaveRequest>
{
    public void Configure(EntityTypeBuilder<LeaveRequest> builder)
    {
        builder.HasKey(lr => lr.LeaveId);

        builder.Property(lr => lr.EmployeeId)
            .IsRequired();


        builder.Property(e => e.FirstName)
           .IsRequired()
           .HasMaxLength(20);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(20);
        builder.Property(lr => lr.LeaveType)
            .IsRequired();

        builder.Property(lr => lr.StartDate)
            .IsRequired();

        builder.Property(lr => lr.EndDate)
            .IsRequired();

        builder.Property(lr => lr.TotalDays)
            .IsRequired();

        builder.Property(lr => lr.Status)
            .IsRequired();

        builder.Property(lr => lr.TimeStamp)
            .IsRequired();

        builder.HasOne(lr => lr.Employee)
            .WithMany(e => e.LeaveRequests)
            .HasForeignKey(lr => lr.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
