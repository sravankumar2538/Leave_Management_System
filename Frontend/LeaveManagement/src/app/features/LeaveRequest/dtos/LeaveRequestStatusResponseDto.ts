export interface LeaveRequestStatusResponseDto {
  leaveId: string;     // GUIDs are always strings in TypeScript/JavaScript for API responses
  employeeId: number;
  firstName?: string;
  lastName?: string;
  leaveType: string;
  startDate: Date;     // Changed to Date object
  endDate: Date;       // Changed to Date object
  totalDays: number;
  status: string;
  timeStamp: Date;     // Changed to Date object
}