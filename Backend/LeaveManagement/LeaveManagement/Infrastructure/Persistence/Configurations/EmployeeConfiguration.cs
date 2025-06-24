using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;



namespace LeaveManagement.Infrastructure.Persistence.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.HasKey(e => e.EmployeeId);

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.Email)
            .IsRequired()
            .HasMaxLength(60);

        builder.Property(e => e.Password)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Role)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasOne<Employee>()
            .WithMany()
            .HasForeignKey(e => e.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(e => e.Attendances)
            .WithOne(a => a.Employee)
            .HasForeignKey(a => a.EmployeeId);

        builder.HasMany(e => e.LeaveRequests)
            .WithOne(lr => lr.Employee)
            .HasForeignKey(lr => lr.EmployeeId);

        builder.HasMany(e => e.LeaveBalances)
            .WithOne(lb => lb.Employee)
            .HasForeignKey(lb => lb.EmployeeId);

        builder.HasMany(e => e.Shifts)
            .WithOne(s => s.Employee)
            .HasForeignKey(s => s.EmployeeId);

        builder.HasMany(e => e.ShiftSwapRequests)
            .WithOne(ssr => ssr.Employee)
            .HasForeignKey(ssr => ssr.EmployeeId);

        List<Employee> employees = new()
        {
            new(){EmployeeId=1,FirstName = "John",LastName="Doe",Email="john.doe@example.com",Password="$2a$12$Ks6Z3pOlqY2D2YsQnelEa.QcBQ8vO3hfbTrVdJ2hzUAgiITOSiZNG",Role="Manager",ManagerId = null},
            new(){EmployeeId=2,FirstName = "Jane",LastName="Smith",Email="jane.smith@example.com",Password="$2a$12$x9bx51R8hNIu9QKRxjoc4u.Rnb95i6XopRBvGZKmOh8Gos.MB8diq",Role="Manager",ManagerId = null},
            new(){EmployeeId=3,FirstName = "Alice",LastName="Johnson",Email="alice.johnson@example.com",Password="$2a$12$ZcMzFVHN2o8NeHt2kFie9O2XC3ifKvKKiIQID0Q9QF6dWb1XHXWAq",Role="Developer",ManagerId = 1},
            new(){EmployeeId=4,FirstName = "Bob",LastName="Brown",Email="bob.brown@example.com",Password="$2a$12$Jlvk0ZipMyod0hWbHdwTj.a.LXAoSLHLYK8ks6cqRAP2x9B41QWD2",Role="DevOps Engineer",ManagerId = 1},
            new(){EmployeeId=5,FirstName = "Charlie",LastName="Davis",Email="charlie.davis@example.com",Password="$2a$12$ocLkjPrgrsxpcZP5lSB9Yu55vjnuB6upLMjc8IE3DmwApPktgxf0q",Role="Maintenance Engineer", ManagerId = 1},
            new(){EmployeeId=6,FirstName = "Eve",LastName="Wilson",Email="eve.wilson@example.com",Password="$2a$12$eKPVuVVDN.mF6yiJCI7rJ.xygoO2or.bVYmeD3MMiQDu1F5afkjUq",Role="Developer", ManagerId = 2},
            new(){EmployeeId=7,FirstName = "Alex",LastName="Jones",Email="alex.jones@example.com",Password="$2a$12$YLUO7lCFz8/xsMgFCVR/J.TYXqL.YwYw/IFMXSO/4Ejbp7fRy1bkm",Role="Tester", ManagerId = 2},
            new(){EmployeeId=8,FirstName = "Maria",LastName="Lopez",Email="maria.lopez@example.com",Password="$2a$12$ymo5uMDo/cUXDDj7yD6qDez5obz.gzuaklWRCHeJB6.Z3hHhWv2sy",Role="Maintenance Engineer", ManagerId = 2},
            new(){EmployeeId=9,FirstName = "Jack",LastName="Lol",Email="jack.lol@example.com",Password="$2a$12$PpI5NzInKWfO3urdDcWHeO2.JogX5UWZGlC85Dyc7hgx/nE6wnpzG",Role="DevOps Engineer", ManagerId = 2},
            new(){EmployeeId=10,FirstName = "Elon",LastName="Mask",Email="elon.mask@example.com",Password="$2a$12$iXteU/cK5cKZLYljSTM1We9D5ogfsnuvzxegm8sEA16zOm9vSApNO",Role="Network Engineer", ManagerId = 2},
            new(){ EmployeeId=11, FirstName = "Jan", LastName = "Doe", Email = "jan.doe@example.com", Password = "$2a$10$vqkRzhNjtniw3CCpsoet8uxGXxWanZwek.LrKQCyAQLVvkIOkQJO2", Role = "Tester", ManagerId = 1 }
        };

        builder.HasData(employees);
    }
}