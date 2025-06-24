export interface UpdateLeaveRequestDto {
  leaveId: string;
  leaveType: string;
  startDate: string; // Changed to string for YYYY-MM-DD format
  endDate: string;   // Changed to string for YYYY-MM-DD format
}