using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LeaveManagement.Controllers;


[ApiController]
[Route("api/[controller]")]
public class HolidayCalendarController : Controller
{
    private readonly IHolidayCalendarService _hoildayCalendarService;

    public HolidayCalendarController(IHolidayCalendarService hoildayCalendarService)
    {
        _hoildayCalendarService = hoildayCalendarService;
    }

    /// <summary>
    /// Retrieves the list of annual holidays.
    /// </summary>
    /// <returns>
    /// An <see cref="IActionResult"/> containing the holiday data.
    /// Returns 200 OK with the holiday data if successful, or 404 Not Found if no holidays are found.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the holiday data if successful, or 404 Not Found if no holidays are found.
    /// </remarks>
    [HttpGet("AnnualHoildays")]
    [ProducesResponseType(typeof(OperationResult<ICollection<HolidayCalendarResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<HolidayCalendarResponseDTO>>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAnnualHolidaysList()
    {
        var holidays = await _hoildayCalendarService.GetAnnualHolidayCalenderAsync();
        if (!holidays.IsSuccess)
        {
            return NotFound(holidays);
        }
        return Ok(holidays);
    }

    /// <summary>
    /// Retrieves the list of the next five upcoming holidays.
    /// </summary>
    /// <returns>
    /// An <see cref="IActionResult"/> containing the holiday data.
    /// Returns 200 OK with the holiday data if successful, or 404 Not Found if no holidays are found.
    /// </returns>
    /// <remarks>
    /// This method returns 200 OK with the holiday data if successful, or 404 Not Found if no holidays are found.
    /// </remarks>
    [HttpGet("UpcomingHoildays")]
    [ProducesResponseType(typeof(OperationResult<ICollection<HolidayCalendarResponseDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(OperationResult<ICollection<HolidayCalendarResponseDTO>>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUpcomingHolidaysList()
    {
        var holidays = await _hoildayCalendarService.UpcomingFiveHolidayCalenderAsync();
        if(!holidays.IsSuccess)
        {
            return NotFound(holidays);
        }
        return Ok(holidays);
    }
}
