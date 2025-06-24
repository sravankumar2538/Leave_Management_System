export interface AttendenceResponseDto {
    attendanceId: string; 
    employeeId: number;
    clockInTime: Date;
    clockOutTime: Date;
    workHours: number;
    date: string; 
    clockIn: number;
    clockOut: number;
  }
