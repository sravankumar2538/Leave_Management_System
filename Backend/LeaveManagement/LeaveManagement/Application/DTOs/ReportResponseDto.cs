// File: LeaveManagement.Application.DTOs/ReportResponseDto.cs
using System; // Needed for DateOnly

namespace LeaveManagement.Application.DTOs;

public class ReportResponseDto
{
    public int PendingLeaveRequest { get; set; }
    public int PendingSwapRequest { get; set; }
    public int TotalEmployees { get; set; }
    public int AbsentEmployees { get; set; }
}