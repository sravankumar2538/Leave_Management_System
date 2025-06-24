using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Persistence.Configurations;

public class ShiftsConfiguration : IEntityTypeConfiguration<Shifts>
{
    public void Configure(EntityTypeBuilder<Shifts> builder)
    {
        builder.HasKey(s => s.ShiftId);

        builder.Property(s => s.EmployeeId)
            .IsRequired();

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(s => s.ShiftDate)
            .IsRequired();

        builder.Property(s => s.ShiftTime)
            .IsRequired();

        builder.HasOne(s => s.Employee)
            .WithMany(e => e.Shifts)
            .HasForeignKey(s => s.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict); // Changed to Restrict to avoid cascade paths
    }
}
