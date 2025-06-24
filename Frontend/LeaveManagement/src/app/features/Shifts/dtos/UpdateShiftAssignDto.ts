export interface UpdateShiftRequestDto {
    shiftId: string; // Guid in C# is usually handled as a string in Angular
    shiftTime: string;
    shiftDate: string; // ISO date string
  }