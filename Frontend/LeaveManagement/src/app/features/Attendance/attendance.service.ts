import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from "../../../environments/environment.developement";
import { ApiResponse } from '../../shared/api-response.interface';
import { HttpClient } from '@angular/common/http';
import {EmployeeAttendanceResponseDto} from "../Attendance/Dtos/EmployeeAttendanceResponseDto"


@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  constructor(private readonly http: HttpClient) { }

  
getEmployeeWeekAttendanceRecords(): Observable<ApiResponse<EmployeeAttendanceResponseDto[]>> {
    return this.http.get<ApiResponse<EmployeeAttendanceResponseDto[]>>(
        `${environment.apiBaseUrl}/Attendance/EmployeeWeekAttendance`, {withCredentials: true}
    );  
}
GetEmployeeAttendanceInDateRangByEmployeeId( startDate: string, endDate:string): Observable<ApiResponse<EmployeeAttendanceResponseDto[]>> {
    return this.http.get<ApiResponse<EmployeeAttendanceResponseDto[]>>(
        `${environment.apiBaseUrl}/Attendance/AttendanceInDateRangeByEmployeeId?startDate=${startDate}&endDate=${endDate}`, {withCredentials: true}
    );
}
GetEmployeeAttendanceInDateRangByManager(startDate: string, endDate:string): Observable<ApiResponse<EmployeeAttendanceResponseDto[]>> {
    return this.http.get<ApiResponse<EmployeeAttendanceResponseDto[]>>(
        `${environment.apiBaseUrl}/Attendance/AttendanceInDateRangeByManager?startDate=${startDate}&endDate=${endDate}`, {withCredentials: true}
    );
}
Clockin(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
        `${environment.apiBaseUrl}/Attendance/ClockIn`,{}, 
        { withCredentials: true }
);
}
Clockout(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
        `${environment.apiBaseUrl}/Attendance/Clockout`,  {},
        { withCredentials: true }
    );
}
 
}










