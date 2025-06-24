export interface ShiftSwapRequestResponseDto {
    shiftRequestId: string; 
    shiftId: string;        
    employeeId: number;
    firstName?: string;    
    lastName?: string;     
    shiftDate: Date;      
    changeShiftFrom: string;
    changeShiftTo: string;
    status: string;
    timeStamp: Date;        
  }