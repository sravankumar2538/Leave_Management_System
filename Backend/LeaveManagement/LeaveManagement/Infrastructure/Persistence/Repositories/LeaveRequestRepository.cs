using LeaveManagement.Domain.Models;
using Microsoft.EntityFrameworkCore;
namespace LeaveManagement.Infrastructure.Persistence.Repositories;

public class LeaveRequestRepository : ILeaveRequestRepository
{
    private readonly LeaveDbContext _context;
    private readonly ILeaveBalanceRepository _leaveBalanceRepository;

    public LeaveRequestRepository(LeaveDbContext context, ILeaveBalanceRepository leaveBalanceRepository) 
    { 
        _context = context;
        _leaveBalanceRepository = leaveBalanceRepository;
    }

    public async Task<OperationResult<string>> ApproveLeaveRequestByManagerAsync(Guid LeaveId, int managerId)
    {
        // fetching leaveId
        var request = await _context.LeaveRequests
            .Include(lr => lr.Employee) 
            .FirstOrDefaultAsync(lr => lr.LeaveId == LeaveId);
        if (request == null)
        {
            return OperationResult<string>.Failure("Leave request not found");
        }
        // checking managerId and employee relationship
        if (request.Employee?.ManagerId != managerId)
        {
            return OperationResult<string>.Failure("Unauthorized action");
        }
        DateTime leaveYearStart = new DateTime(DateTime.Now.Year, 4, 1);
        if (DateTime.Now.Month < 4) 
        {
            leaveYearStart = leaveYearStart.AddYears(-1);
        }
        DateOnly yearStartDate = DateOnly.FromDateTime(leaveYearStart);

        // fetching current year April 1st date checks on leave balance sheet present or not for particular employee
        var leaveBalance = await _context.LeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == request.EmployeeId && lb.Year == yearStartDate);

        if (leaveBalance == null)
        {
            return OperationResult<string>.Failure("Leave balance missing");
        }
        // reducing leavebalance count of particalar leavetype
        switch (request.LeaveType?.ToLowerInvariant()) 
        {
            case "casual":
                if(leaveBalance.Casual >= request.TotalDays)
                {
                    leaveBalance.Casual -= request.TotalDays;
                }
                else
                {
                    return OperationResult<string>.Failure("Employee's leave balance is too low");
                }
                break;
            case "sick":
                if (leaveBalance.Sick >= request.TotalDays)
                {
                    leaveBalance.Sick -= request.TotalDays;
                }
                else
                {
                    return OperationResult<string>.Failure("Employee's leave balance is too low");
                }
                break;
            case "vacation":
                if (leaveBalance.Vacation >= request.TotalDays)
                {
                    leaveBalance.Vacation -= request.TotalDays;
                }
                else
                {
                    return OperationResult<string>.Failure("Employee's leave balance is too low");
                }
                break;
            case "medical":
                if (leaveBalance.Medical >= request.TotalDays)
                {
                    leaveBalance.Medical -= request.TotalDays;
                }
                else
                {
                    return OperationResult<string>.Failure("Employee's leave balance is too low");
                }
                break;
            default:
                return OperationResult<string>.Failure($"Invalid leave type: {request.LeaveType}");
        }
        // Approving leave request
        request.Status = "Approved";
        request.TimeStamp = DateTime.Now; 
        _context.LeaveBalances.Update(leaveBalance);
        _context.LeaveRequests.Update(request);
        await _context.SaveChangesAsync();
        return OperationResult<string>.Success($"Leave {request.Status} Successfully");

    }
    public async Task<OperationResult<string>> CancelLeaveRequestBeforeApprovalByEmployeeIdAsync(Guid leaveId, int employeeId)
    {
        // Fetching leave request from database
        // Using FindAsync for primary key lookup. If LeaveId is not primary key, use SingleOrDefaultAsync.
        var request = await _context.LeaveRequests.FindAsync(leaveId);

        if (request == null)
        {
            return OperationResult<string>.Failure("Leave request not found.");
        }

        // Checking if the request belongs to the authenticated employee
        if (request.EmployeeId != employeeId)
        {
            return OperationResult<string>.Failure("Unauthorized Access: You can only cancel your own leave requests.");
        }

        // Checking if the request is still in a cancellable state (Pending)
        // TODO: Consider using an Enum for status values (e.g., LeaveStatus.Pending) for better type safety and maintainability.
        if (request.Status == "Pending")
        {
            // Deleting (logically cancelling) leave request by employee
            request.Status = "Cancelled";
            request.TimeStamp = DateTime.Now; // Use UtcNow for consistency in database timestamps
            _context.LeaveRequests.Update(request); // Mark as updated

            try
            {
                await _context.SaveChangesAsync(); // Save changes to the database
                return OperationResult<string>.Success("Leave request cancelled successfully.");
            }
            catch (DbUpdateException)
            {
                // In a real application, you might log the exception details here
                // even without ILogger (e.g., to a file or another monitoring system).
                return OperationResult<string>.Failure("An error occurred while saving the cancellation. Please try again.");
            }
        }
        else
        {
            // Returning a more informative message about why it cannot be cancelled
            return OperationResult<string>.Failure($"Cannot cancel request. Its current status is '{request.Status}'.");
        }
    }

    public async Task<OperationResult<ICollection<LeaveRequest>>> GetEmployeeLeaveRequestStatusByEmployeeIdAsync(int employeeId)
    {
        // fetching current date
        DateOnly today = DateOnly.FromDateTime(DateTime.Now);
        // fetching leave request status by Employee Id 
        var result = await _context.LeaveRequests.Where(s => s.EmployeeId == employeeId && s.EndDate >= today)
            .OrderBy(s => s.StartDate)
            .ToListAsync();
        if(result == null || result.Count == 0)
        {
            return OperationResult<ICollection<LeaveRequest>>.Failure("No Data Found");
        }
        // returning result list
        return OperationResult<ICollection<LeaveRequest>>.Success(result);
    }

    public async Task<OperationResult<ICollection<LeaveRequest>>> GetEmployeeRequestsByManagerIdAsync(int managerId)
    {
        // fetching current date
        DateOnly today = DateOnly.FromDateTime(DateTime.Now);
        // fetching all pending leave request status by Manager Id
        var result = await _context.LeaveRequests
            .Include(s => s.Employee)
            .Where(s => s.Employee != null && s.Employee.ManagerId == managerId && s.StartDate > today && s.Status == "Pending")
            .OrderBy(s => s.StartDate)
            .ToListAsync();
        if (result == null || result.Count == 0)
        {
            return OperationResult<ICollection<LeaveRequest>>.Failure("No Data Found");
        }
        // returning result list
        return OperationResult<ICollection<LeaveRequest>>.Success(result);
    }

    public async Task<OperationResult<string>> RejectLeaveRequestByManagerAsync(Guid LeaveId, int managerId)
    {
        // fetching leave request from database 
        var request = await _context.LeaveRequests
            .Include(lr => lr.Employee) 
            .FirstOrDefaultAsync(lr => lr.LeaveId == LeaveId);
        if (request == null)
        {
            return OperationResult<string>.Failure("Leave request not found");
        }
        // checking manager and employee relationship
        if (request.Employee?.ManagerId != managerId)
        {
            return OperationResult<string>.Failure("Unauthorized to reject");
        }
        // rejecting leave request 
        request.Status = "Rejected";
        request.TimeStamp = DateTime.Now; 
        _context.LeaveRequests.Update(request);
        await _context.SaveChangesAsync();
        return OperationResult<string>.Success($"Leave Request {request.Status} Successfully");
    }

    public async Task<OperationResult<string>> SubmitLeaveRequestByEmployeeAsync(LeaveRequest leaveRequest)
    {
        // Fetching employee details (though 'employee' variable is not used after this line)
        var employee = await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeId == leaveRequest.EmployeeId);

        // Checking for overlapping leave requests that are NOT 'Rejected'
        // This allows employees to re-request leave for dates that were previously rejected.
        var overlappingRequest = await _context.LeaveRequests.FirstOrDefaultAsync(lr =>
            lr.EmployeeId == leaveRequest.EmployeeId &&
            lr.StartDate <= leaveRequest.EndDate &&
            lr.EndDate >= leaveRequest.StartDate &&
            lr.Status != "Rejected" && lr.Status != "Cancelled"// Exclude rejected requests from overlapping check
        );

        if (overlappingRequest != null)
        {
            // Return a more specific message indicating the overlapping period
            return OperationResult<string>.Failure($"Leave already requested for overlapping dates ({overlappingRequest.StartDate} to {overlappingRequest.EndDate}) with status '{overlappingRequest.Status}'.");
        }

        // Checking if an identical leave request already exists (same employee, type, start, end dates)
        var check = await _context.LeaveRequests.FirstOrDefaultAsync(c =>
            c.EmployeeId == leaveRequest.EmployeeId &&
            c.LeaveType == leaveRequest.LeaveType &&
            c.StartDate == leaveRequest.StartDate &&
            c.EndDate == leaveRequest.EndDate &&
            c.Status != "Cancelled"
            );

        if (check == null)
        {
            // Define the start date for the fiscal year (April 1st of the current year)
            DateTime fiscalYearStart = new DateTime(DateTime.Now.Year, 4, 1);
            DateOnly yearStartDate = DateOnly.FromDateTime(fiscalYearStart);

            // Fetch the employee's leave balance for the current fiscal year
            var leaveBalance = await _context.LeaveBalances.FirstOrDefaultAsync(lb => lb.EmployeeId == leaveRequest.EmployeeId && lb.Year == yearStartDate);

            // If no leave balance exists for the employee for the current year, add a new one
            if (leaveBalance == null)
            {
                leaveBalance = await _leaveBalanceRepository.AddLeaveBalanceForEmployeeAsync(leaveRequest.EmployeeId, yearStartDate);
            }

            // Determine the available leave days based on the requested leave type
            int availableLeaveDays = leaveRequest.LeaveType switch
            {
                "Casual" => leaveBalance.Casual,
                "Sick" => leaveBalance.Sick,
                "Vacation" => leaveBalance.Vacation,
                "Medical" => leaveBalance.Medical,
                _ => throw new ArgumentException("Invalid leave type specified.") // Handle invalid leave types
            };

            // Calculate the total number of leave days requested, excluding weekends and public holidays
            leaveRequest.TotalDays = await CalculateTotalLeaveDaysAsync(leaveRequest.StartDate.ToDateTime(TimeOnly.MinValue), leaveRequest.EndDate.ToDateTime(TimeOnly.MinValue));

            // Validate that the calculated total leave days are positive
            if (leaveRequest.TotalDays <= 0)
            {
                return OperationResult<string>.Failure("Enter valid dates. Total leave days calculated is zero or negative (considering weekends and holidays).");
            }

            // Check for insufficient leave balance before proceeding
            if (availableLeaveDays < leaveRequest.TotalDays)
            {
                return OperationResult<string>.Failure("Insufficient leave balance for the requested leave type and duration.");
            }

            // Assign a new unique ID to the leave request
            leaveRequest.LeaveId = Guid.NewGuid();
            // Populate employee's first and last name from the fetched employee details
            leaveRequest.FirstName = employee?.FirstName;
            leaveRequest.LastName = employee?.LastName;
            // Set the initial status of the leave request to "Pending"
            leaveRequest.Status = "Pending";
            // Record the timestamp of the request submission
            leaveRequest.TimeStamp = DateTime.Now;

            // Add the new leave request to the database context
            _context.LeaveRequests.Add(leaveRequest);
            // Save changes to the database
            await _context.SaveChangesAsync();

            // Return a success message
            return OperationResult<string>.Success("Leave request submitted successfully.");
        }
        else
        {
            // If an identical request already exists, return a failure with its status
            return OperationResult<string>.Failure($"A similar leave request already exists with status '{check.Status}'.");
        }
    }

    private async Task<int> CalculateTotalLeaveDaysAsync(DateTime startDate, DateTime endDate)
    {
        // calculating total leave days
        int totalDays = 0;
        // fetching public holidays list between leave dates range
        var holidays = await _context.HolidayCalendars
                                     .Where(hc => hc.Date >= DateOnly.FromDateTime(startDate) && hc.Date <= DateOnly.FromDateTime(endDate))
                                     .Select(hc => hc.Date.ToDateTime(TimeOnly.MinValue))
                                     .ToListAsync();
        for (DateTime date = startDate; date <= endDate; date = date.AddDays(1))
        {
            if (date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday && !holidays.Contains(date))
            {
                totalDays++;
            }
        }
        return totalDays;
    }

    public async Task<OperationResult<string>> UpdateLeaveRequestStatusBeforeApprovalAsync(Guid leaveId, LeaveRequest leaveRequest)
    {
        // fetching leave request
        var request = await _context.LeaveRequests
            .Where(l => l.LeaveId == leaveId && l.EmployeeId == leaveRequest.EmployeeId)
            .FirstOrDefaultAsync();

        if (request == null)
        {
            return OperationResult<string>.Failure("Request not found");
        }

        // Ensure LeaveType is not null before assigning it to a non-nullable variable
        if (string.IsNullOrWhiteSpace(leaveRequest.LeaveType))
        {
            return OperationResult<string>.Failure("LeaveType cannot be null or empty.");
        }

        // Define the statuses that should be considered for overlapping
        string[] activeStatuses = { "Approved", "Pending", "Rejected" };

        // checking dates overlapping with other *existing* requests for the same employee, excluding the current request being updated.
        var overlappingRequest = await _context.LeaveRequests.FirstOrDefaultAsync(lr =>
            lr.LeaveId != request.LeaveId && // Exclude the current leave request being updated
            lr.EmployeeId == leaveRequest.EmployeeId &&
            activeStatuses.Contains(lr.Status) && // Only consider requests with "Approved", "Pending", "Rejected" statuses
            lr.StartDate <= leaveRequest.EndDate &&
            lr.EndDate >= leaveRequest.StartDate);

        if (overlappingRequest != null)
        {
            return OperationResult<string>.Failure($"Leave already requested for overlapping dates ({overlappingRequest.StartDate.ToShortDateString()} to {overlappingRequest.EndDate.ToShortDateString()}) with a {overlappingRequest.Status} status.");
        }

        // fetching current date for checking leave dates greater than current date or not
        DateOnly today = DateOnly.FromDateTime(DateTime.Now);

        if (leaveRequest.StartDate > leaveRequest.EndDate)
        {
            return OperationResult<string>.Failure("Invalid Dates: Start date cannot be after end date.");
        }

        // checking dates valid or not (cannot be in the past)
        if (leaveRequest.StartDate < today || leaveRequest.EndDate < today)
        {
            return OperationResult<string>.Failure("Invalid Dates: Leave start or end date cannot be in the past.");
        }

        // If no changes were made to key fields, return "No changes made"
        if (leaveRequest.LeaveType.Equals(request.LeaveType, StringComparison.OrdinalIgnoreCase) &&
            leaveRequest.StartDate == request.StartDate &&
            leaveRequest.EndDate == request.EndDate)
        {
            return OperationResult<string>.Failure("No changes made");
        }

        // update possible only if leave request is in pending state
        if (request.Status == "Pending")
        {
            // Calculate total days for the new requested period using the provided logic
            int newTotalDays = await CalculateTotalLeaveDaysAsync(leaveRequest.StartDate.ToDateTime(TimeOnly.MinValue), leaveRequest.EndDate.ToDateTime(TimeOnly.MinValue));

            if (newTotalDays > 0)
            {
                // --- Leave Balance Check based on specific year logic (April 1st) ---
                // Determine the current year's balance record based on the specified April 1st rule.
                int currentYear = DateTime.Now.Year;
                DateOnly balanceLookupYearDate = new DateOnly(currentYear, 4, 1); // Explicitly set to April 1st of the current year

                var leaveBalance = await _context.LeaveBalances
                                                 .Where(lb => lb.EmployeeId == leaveRequest.EmployeeId &&
                                                               lb.Year == balanceLookupYearDate) // Match the exact DateOnly value
                                                 .FirstOrDefaultAsync();

                if (leaveBalance == null)
                {
                    return OperationResult<string>.Failure($"No leave balance found for employee for year starting {balanceLookupYearDate.Year}.");
                }

                int availableBalanceForType = 0;
                string requestedLeaveType = leaveRequest.LeaveType.ToLowerInvariant(); // Normalize for comparison

                // Dynamically get the balance based on LeaveType
                switch (requestedLeaveType)
                {
                    case "casual":
                        availableBalanceForType = leaveBalance.Casual;
                        break;
                    case "sick":
                        availableBalanceForType = leaveBalance.Sick;
                        break;
                    case "vacation":
                        availableBalanceForType = leaveBalance.Vacation;
                        break;
                    case "medical":
                        availableBalanceForType = leaveBalance.Medical;
                        break;
                    default:
                        return OperationResult<string>.Failure($"Invalid LeaveType specified: {leaveRequest.LeaveType}.");
                }

                // If the leave type *changes*, we just check against the current available balance
                // of the *new* leave type, without adding back days from the *old* leave type.

                if (newTotalDays > availableBalanceForType)
                {
                    return OperationResult<string>.Failure($"Insufficient leave balance for {leaveRequest.LeaveType}. Available: {availableBalanceForType} days. Requested: {newTotalDays} days.");
                }
                // --- END Leave Balance Check ---

                // Update the request details (NO CHANGES TO LeaveBalance data here)
                request.LeaveType = leaveRequest.LeaveType;
                request.StartDate = leaveRequest.StartDate;
                request.EndDate = leaveRequest.EndDate;
                request.TimeStamp = DateTime.Now;
                request.TotalDays = newTotalDays; // Update total days based on new dates

                _context.LeaveRequests.Update(request);
                await _context.SaveChangesAsync();

                return OperationResult<string>.Success("Leave Request Updated Successfully");
            }
            else
            {
                return OperationResult<string>.Failure("Enter valid Dates (total days must be greater than 0).");
            }
        }
        else
        {
            return OperationResult<string>.Failure($"Request already {request.Status}");
        }
    }



}
