export interface EmployeeShiftsResponseDto {
    shiftId: string;
    employeeId: number;
    firstName: string;
    lastName: string ;
    shiftDate: Date;
    shiftTime : string;
    status?: 'Pending' | 'Approved' | 'Rejected' | null; // Added status for swap request
}