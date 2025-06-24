using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LeaveManagement.Infrastructure.Persistence.Configurations;

public class HolidayCalendarConfiguration : IEntityTypeConfiguration<HolidayCalendar>
{
    public void Configure(EntityTypeBuilder<HolidayCalendar> builder)
    {

        builder.HasKey(e => e.Date);
        builder.Property(e => e.Description)
            .IsRequired();
        builder.Property(e => e.Year)
            .IsRequired();

        List<HolidayCalendar> holidays = new()
        {
        new() { Date = new DateOnly(2025, 1, 1), Description = "New Year's Day", Year = 2025 },
        new() { Date = new DateOnly(2025, 1, 14), Description = "Pongal", Year = 2025 },
        new() { Date = new DateOnly(2025, 1, 26), Description = "Republic Day", Year = 2025 },
        new() { Date = new DateOnly(2025, 3, 21), Description = "Holi", Year = 2025 },
        new() { Date = new DateOnly(2025, 4, 14), Description = "Tamil New Year", Year = 2025 },
        new() { Date = new DateOnly(2025, 5, 1), Description = "Labour Day", Year = 2025 },
        new() { Date = new DateOnly(2025, 8, 15), Description = "Independence Day", Year = 2025 },
        new() { Date = new DateOnly(2025, 9, 17), Description = "Ganesh Chaturthi", Year = 2025 },
        new() { Date = new DateOnly(2025, 10, 2), Description = "Gandhi Jayanti", Year = 2025 },
        new() { Date = new DateOnly(2025, 10, 22), Description = "Dussehra", Year = 2025 },
        new() { Date = new DateOnly(2025, 11, 4), Description = "Diwali", Year = 2025 },
        new() { Date = new DateOnly(2025, 12, 25), Description = "Christmas", Year = 2025 }
        };


        builder.HasData(holidays);
    }







}