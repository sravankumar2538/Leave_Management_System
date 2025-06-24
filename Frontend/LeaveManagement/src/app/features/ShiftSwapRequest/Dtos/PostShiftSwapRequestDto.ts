export interface PostShiftSwapRequestDto {
    shiftId: string; 
    changeShiftForm : string;
    changeShiftTo: string;
    shiftDate: string;
    status?: 'Pending' | 'Approved' | 'Rejected' | null; // Optional status field
    // Additional fields can be added as needed
  }