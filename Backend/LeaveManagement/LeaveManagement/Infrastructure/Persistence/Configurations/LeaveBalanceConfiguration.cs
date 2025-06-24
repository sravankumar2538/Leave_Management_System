using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.Infrastructure.Persistence.Configurations;

public class LeaveBalanceConfiguration : IEntityTypeConfiguration<LeaveBalance>
{
    public void Configure(EntityTypeBuilder<LeaveBalance> builder)
    {
        builder.HasKey(lb => new { lb.EmployeeId });

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(lb => lb.Year)
            .IsRequired();
        builder.Property(lb => lb.Casual)
            .IsRequired();

        builder.Property(lb => lb.Sick)
            .IsRequired();

        builder.Property(lb => lb.Vacation)
            .IsRequired();

        builder.Property(lb => lb.Medical)
            .IsRequired();

        builder.HasOne(lb => lb.Employee)
            .WithMany(e => e.LeaveBalances)
            .HasForeignKey(lb => lb.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
