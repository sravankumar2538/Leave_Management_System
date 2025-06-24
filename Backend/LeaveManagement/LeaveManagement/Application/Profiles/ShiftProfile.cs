using AutoMapper;
using LeaveManagement.Domain.Models; // Ensure your domain models are accessible
using LeaveManagement.Application.DTOs; // Ensure your DTOs are accessible
using System.Linq; // Needed for .FirstOrDefault(), .OrderByDescending()

namespace LeaveManagement.Application.Profiles; // Make sure this namespace matches your project structure

public class ShiftsProfile : Profile
{
    public ShiftsProfile()
    {
        CreateMap<Shifts, ShiftsResponseDTO>()
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src =>
                // Logic to get the most relevant ShiftSwapRequest status:
                // 1. Filter to requests for this specific shift (though usually handled by navigation property).
                // 2. Order by 'Pending' status first (true=1, false=0 means 'Pending' comes before others).
                // 3. Then, order by the most recent timestamp for tie-breaking or for non-pending requests.
                // 4. Select only the Status string.
                // 5. Get the first (most relevant) status, or null if no matching requests.
                src.ShiftSwapRequests
                    .Where(ssr => ssr.ShiftId == src.ShiftId) // Good practice to filter explicitly
                    .OrderByDescending(ssr => ssr.Status == "Pending")
                    .ThenByDescending(ssr => ssr.TimeStamp)
                    .Select(ssr => ssr.Status)
                    .FirstOrDefault()
            ))
            // Explicitly map other properties for clarity and robustness.
            // This ensures all properties are mapped correctly even if names slightly differ or
            // if you need to fetch from navigation properties.
            .ForMember(dest => dest.ShiftId, opt => opt.MapFrom(src => src.ShiftId))
            .ForMember(dest => dest.EmployeeId, opt => opt.MapFrom(src => src.EmployeeId))
            // Assuming FirstName/LastName in ShiftsResponseDTO should come from the associated Employee entity
            // if available, otherwise from the denormalized properties on the Shift itself.
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.Employee != null ? src.Employee.FirstName : src.FirstName))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.Employee != null ? src.Employee.LastName : src.LastName))
            .ForMember(dest => dest.ShiftDate, opt => opt.MapFrom(src => src.ShiftDate))
            .ForMember(dest => dest.ShiftTime, opt => opt.MapFrom(src => src.ShiftTime));

        // You can keep ReverseMap() if you also need to map from DTO back to Entity
        // and if a reverse mapping makes sense for all fields.
        // For 'Status', reverse mapping usually isn't needed as it's derived.
        // If you don't need DTO to Entity mapping, remove .ReverseMap().
        // If you need it, you'd typically define a separate mapping for it or ensure
        // you handle properties like 'Status' which don't map back directly.
        // For simplicity and safety regarding 'Status', I'll comment out ReverseMap,
        // but uncomment if you confirm its necessity and handle it properly.
        // .ReverseMap();
    }
}