using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Persistence.Configurations;

public class ShiftSwapRequestConfiguration : IEntityTypeConfiguration<ShiftSwapRequest>
{
    public void Configure(EntityTypeBuilder<ShiftSwapRequest> builder)
    {
        builder.HasKey(ssr => ssr.ShiftRequestId);

        builder.Property(ssr => ssr.ShiftId)
            .IsRequired();

        builder.Property(ssr => ssr.EmployeeId)
            .IsRequired();

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(ssr => ssr.ShiftDate)
            .IsRequired();

        builder.Property(ssr => ssr.ChangeShiftFrom)
            .IsRequired();

        builder.Property(ssr => ssr.ChangeShiftTo)
            .IsRequired();

        builder.Property(ssr => ssr.Status)
            .IsRequired();

        builder.Property(ssr => ssr.TimeStamp)
            .IsRequired();

        builder.HasOne(ssr => ssr.Shift)
            .WithMany(s => s.ShiftSwapRequests)
            .HasForeignKey(ssr => ssr.ShiftId)
            .OnDelete(DeleteBehavior.Restrict); // Changed to Restrict to avoid cascade paths

        builder.HasOne(ssr => ssr.Employee)
            .WithMany(e => e.ShiftSwapRequests)
            .HasForeignKey(ssr => ssr.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict); // Changed to Restrict to avoid cascade paths
    }
}
