import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/api-response.interface';
import { LeaveBalanceResponseDto } from '../LeaveBalance/Dtos/LeaveBalanceResponse.dto'; // Adjust the path as needed
import { environment } from "../../../environments/environment.developement";

@Injectable({
  providedIn: 'root'
})
export class LeaveBalanceService {

  constructor(private readonly http: HttpClient) { }
  getAllHolidays(): Observable<ApiResponse<LeaveBalanceResponseDto[]>> {
    return this.http.get<ApiResponse<LeaveBalanceResponseDto[]>>(
        `${environment.apiBaseUrl}/LeaveBalance/ByEmployeeId`,{ withCredentials: true }
    );
}
}

