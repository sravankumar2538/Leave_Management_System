export interface UpdateShiftSwapRequestDto {
    shiftRequestId: string;
    shiftDate: string;        // Must be string (e.g., 'YYYY-MM-DD') for backend API
    changeShiftFrom: string;
    changeShiftTo: string;
  }