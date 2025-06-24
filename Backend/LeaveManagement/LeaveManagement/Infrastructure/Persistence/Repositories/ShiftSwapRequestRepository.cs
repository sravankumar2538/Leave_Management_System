using Microsoft.EntityFrameworkCore;


namespace LeaveManagement.Infrastructure.Persistence.Repositories;

public class ShiftSwapRequestRepository : IShiftSwapRequestRepository
{

    private readonly LeaveDbContext _context;
    private readonly ITokenService _tokenService;

    public ShiftSwapRequestRepository(LeaveDbContext context, ITokenService tokenService) 
    {
        _context = context;
        _tokenService = tokenService;
    }
    public async Task<OperationResult<string>> ApproveShiftSwapRequestByManagerIdAsync(Guid ShiftRequestId, int managerId)
    {
        // fetching shift swap request
        var request = await _context.ShiftSwapRequests
            .Include(ssr => ssr.Employee)
            .FirstOrDefaultAsync(ssr => ssr.ShiftRequestId == ShiftRequestId);
        if (request == null)
        {
            return OperationResult<string>.Failure("Swap request not found");
        }
        // checking manager
        if (request.Employee?.ManagerId != managerId)
        {
            return OperationResult<string>.Failure("Unauthorized Access");
        }
        // checking the request in pending state or not
        if (request.Status != "Pending")
        {
            return OperationResult<string>.Failure($"Already {request.Status}");
        }
        // Approving Shift Swap request by manager
        request.Status = "Approved";
        request.TimeStamp = DateTime.Now;
        var shift = await _context.Shifts.FindAsync(request.ShiftId);
        if (shift == null)
        {
            return OperationResult<string>.Failure("Associated shift not found");
        }
        shift.ShiftTime = request.ChangeShiftTo ?? string.Empty;
        _context.ShiftSwapRequests.Update(request);
        _context.Shifts.Update(shift);
        await _context.SaveChangesAsync();
        return OperationResult<string>.Success($"Request {request.Status} Successfully" ); 
    }

    public async Task<OperationResult<string>> CancelShiftSwapByEmployeeIdAsync(Guid shiftRequestId, int employeeId)
    {
        // Fetching the shift swap request from the database
        // Using FirstOrDefaultAsync is appropriate if ShiftRequestId might not be the primary key,
        // or if you're including related entities (though none are included here).
        var request = await _context.ShiftSwapRequests
            .FirstOrDefaultAsync(ssr => ssr.ShiftRequestId == shiftRequestId);

        if (request == null)
        {
            return OperationResult<string>.Failure("Shift swap request not found.");
        }

        // Checking if the request belongs to the employee attempting to cancel it (authorization check)
        if (request.EmployeeId != employeeId)
        {
            return OperationResult<string>.Failure("Unauthorized Access: You can only cancel your own shift swap requests.");
        }

        // Checking if the shift swap request is in a cancellable state (Pending)
        // TODO: Consider using an Enum for status values (e.g., ShiftSwapStatus.Pending) for better type safety and maintainability.
        if (request.Status == "Pending")
        {
            // Logically cancelling the shift swap request
            request.Status = "Cancelled"; // Update the status to 'Cancelled'
            request.TimeStamp = DateTime.Now; // Use UTC time for consistency in database timestamps

            _context.ShiftSwapRequests.Update(request); // Mark the entity as updated in the DbContext

            try
            {
                await _context.SaveChangesAsync(); // Persist changes to the database
                return OperationResult<string>.Success("Shift swap request withdrawn successfully.");
            }
            catch (DbUpdateException)
            {
                // In a real application, you would log the exception details here
                // to diagnose database-related issues.
                return OperationResult<string>.Failure("An error occurred while saving the cancellation. Please try again.");
            }
        }
        else
        {
            // The request cannot be cancelled because it's not in the 'Pending' state
            return OperationResult<string>.Failure($"Cannot withdraw request. Its current status is '{request.Status}'.");
        }
    }

    public async Task<OperationResult<string>> CreateShiftSwapRequestAsync(int employeeId,ShiftSwapRequest shiftSwapRequest)
    {
        // fetching employee details from database
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeId == employeeId);
        // checking shift swap request requested before or not 
        var check = await _context.ShiftSwapRequests.FirstOrDefaultAsync(c => c.ShiftId == shiftSwapRequest.ShiftId);
        if (check != null && check.Status != "Cancelled")
        {
            return OperationResult<string>.Failure("Swap already requested");
        }
       
        // checking shift request 
        var shift = await _context.Shifts.FirstOrDefaultAsync(s => s.ShiftId == shiftSwapRequest.ShiftId );
        if(shift == null)
        {
            return OperationResult<string>.Failure("Shift not found");
        }
        // creating new shit swap request for an shift ID
        shiftSwapRequest.ChangeShiftFrom = shift.ShiftTime;
        shiftSwapRequest.ShiftDate = shift.ShiftDate;
        shiftSwapRequest.EmployeeId = employeeId;
        shiftSwapRequest.FirstName = employee?.FirstName;
        shiftSwapRequest.LastName = employee?.LastName;
        shiftSwapRequest.Status = "Pending";
        shiftSwapRequest.TimeStamp = DateTime.Now;
        _context.ShiftSwapRequests.Add(shiftSwapRequest);
        await _context.SaveChangesAsync();
        return OperationResult<string>.Success("Shift Swap Request Submitted Successfully");
    }


    public async Task<OperationResult<ICollection<ShiftSwapRequest>>> GetAllShiftSwapRequestsByManagerIdAsync(int managerId)
    {
        // fetching current date
        DateOnly today = DateOnly.FromDateTime(DateTime.Now);
        // fetching pending employee shift swap request by manager
        var result =  await _context.ShiftSwapRequests
         .Where(s => s.Employee != null && s.Employee.ManagerId == managerId && s.ShiftDate > today && s.Status == "Pending")
         .OrderBy(s => s.ShiftDate)
         .ToListAsync();
        if(result.Count == 0 || result == null)
        {
            return OperationResult<ICollection<ShiftSwapRequest>>.Failure("No Data Found");
        }
        // returing result list
        return OperationResult<ICollection<ShiftSwapRequest>>.Success(result);
    }
   
    public async Task<OperationResult<ICollection<ShiftSwapRequest>>> GetShiftSwapStatusByEmployeeIdAsync(int employeeId)
    {
        // fetching current date
        DateOnly today = DateOnly.FromDateTime(DateTime.Now);
        // fetching employee shift swap request by employees
        var result = await _context.ShiftSwapRequests.Where(r => r.EmployeeId == employeeId && r.ShiftDate >= today).OrderBy(s => s.ShiftDate).ToListAsync();
        if(result.Count == 0 || result == null)
        {
            return OperationResult<ICollection<ShiftSwapRequest>>.Failure("No Data Found");
        }
        // returing result list
        return OperationResult<ICollection<ShiftSwapRequest>>.Success(result);
    }

    public async Task<OperationResult<string>> RejectShiftSwapRequestByManagerIdAsync(Guid ShiftRequestId, int managerId)
    {
        // fetching shift swap request
        var request = await _context.ShiftSwapRequests
            .Include(ssr => ssr.Employee)
            .FirstOrDefaultAsync(ssr => ssr.ShiftRequestId == ShiftRequestId);
        if (request == null)
        {
            return OperationResult<string>.Failure("Swap request not found");
        }
        // checking employee and manager relation ship
        if (request.Employee?.ManagerId != managerId)
        {
            return OperationResult<string>.Failure("Unauthorized Access");
        }
        // checking if shift swap request in pending state or not
        if (request.Status != "Pending")
        {
            return OperationResult<string>.Failure($"Already {request.Status}");
        }
        // rejecting Shift swap request by manager
        request.Status = "Rejected";
        request.TimeStamp = DateTime.Now;
        _context.ShiftSwapRequests.Update(request);
        await _context.SaveChangesAsync();
        // returing success message
        return OperationResult<string>.Success($"Shift Swap {request.Status} Successfully");
    }

    public async Task<OperationResult<string>> UpdateShiftSwapRequestAsync(Guid ShiftRequestId, ShiftSwapRequest updatedShiftSwapRequest, int employeeId)
    {
        // fetching shift swap request
        var request = await _context.ShiftSwapRequests
            .FirstOrDefaultAsync(ssr => ssr.ShiftRequestId == ShiftRequestId);
        if (request == null)
        {
            return OperationResult<string>.Failure("Swap request not found");
        }
        // checking employee or not
        if (request.EmployeeId != employeeId)
        {
            return OperationResult<string>.Failure("Unauthorized update");
        }
        // checking dates valid or not
        if(request.ChangeShiftTo == updatedShiftSwapRequest.ChangeShiftTo)
        {
            throw new FormatException($"Enter Valid Data");
        }
        if (request.ChangeShiftFrom == updatedShiftSwapRequest.ChangeShiftTo)
        {
            return OperationResult<string>.Failure("Enter Valid Data");
        }
        // checking the shift swap request in pending state or not
        if (request.Status != "Pending")
        {
            return OperationResult<string>.Failure($"Already {request.Status}");
        }
        // updating shift swap request by employee
        request.ChangeShiftTo = updatedShiftSwapRequest.ChangeShiftTo;
        request.EmployeeId = employeeId; 
        request.TimeStamp = DateTime.Now; 
        _context.ShiftSwapRequests.Update(request);
        await _context.SaveChangesAsync();
        return OperationResult<string>.Success("Shift Swap Requested Successfully");
    }
}
