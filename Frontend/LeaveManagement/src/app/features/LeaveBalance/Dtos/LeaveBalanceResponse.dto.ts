export interface LeaveBalanceResponseDto {
    employeeId: number;
    firstName?: string; // string? in C# maps to optional string in TypeScript
    lastName?: string;  // string? in C# maps to optional string in TypeScript
    year: string;       // DateOnly (representing just the year) maps to string
    casual: number;
    sick: number;
    vacation: number;
    medical: number;
  }

  