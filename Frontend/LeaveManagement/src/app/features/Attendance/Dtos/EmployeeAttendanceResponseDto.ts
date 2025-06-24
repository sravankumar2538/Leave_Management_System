export interface EmployeeAttendanceResponseDto {
    clockOut(clockOut: any): unknown;
    clockIn(clockIn: any): unknown;
    date: string; // DateOnly maps to string (e.g., 'YYYY-MM-DD')
    employeeId: number;
    firstName?: string; // string? in C# maps to optional string in TypeScript
    lastName?: string;  // string? in C# maps to optional string in TypeScript
    clockInTime: Date;
    clockOutTime: Date;
    workHours: number;
    percentage: number;
  }