import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from "../../../environments/environment.developement";
import { ApiResponse } from '../../shared/api-response.interface';
// import { LoginDTO } from '../Auth/Dtos/login-payload.dto'; 
import {EmployeeListResponseDTO} from "../Employee/Dtos/EmployeeListResponse-payload.dto"
 
@Injectable({
    providedIn: 'root'
})
 
export class EmployeeService {
    constructor(private readonly http: HttpClient) {}
 
    getAllEmployeesByManager(): Observable<ApiResponse<EmployeeListResponseDTO[]>> {
        return this.http.get<ApiResponse<EmployeeListResponseDTO[]>>(
            `${environment.apiBaseUrl}/Employee/AllEmployeesByManagerId`, {withCredentials: true});
    }

    getAbsentEmployeesByManager(): Observable<ApiResponse<EmployeeListResponseDTO[]>> {
        return this.http.get<ApiResponse<EmployeeListResponseDTO[]>>(
            `${environment.apiBaseUrl}/Employee/AbsentEmployees`, {withCredentials: true});
    }
 
    GetEmployeeProfile(): Observable<ApiResponse<EmployeeListResponseDTO[]>> {
        return this.http.get<ApiResponse<EmployeeListResponseDTO[]>>(`${environment.apiBaseUrl}/Employee/EmployeeProfile`, {withCredentials: true});
      }
 
    GetEmployeeByRole( role: string): Observable<ApiResponse<EmployeeListResponseDTO[]>> {
        return this.http.get<ApiResponse<EmployeeListResponseDTO[]>>(
            `/Employee/ByRole${role}`, { withCredentials: true });
    }
 
    GetCurrentDayEmployees(): Observable<ApiResponse<EmployeeListResponseDTO[]>> {
        return this.http.get<ApiResponse<EmployeeListResponseDTO[]>>(
            `${environment.apiBaseUrl}/Employee/CurrentDayEmployeeByManagerId`, { withCredentials: true });
    }
     
    // login(payload: LoginDTO): Observable<ApiResponse<LoginDTO>> {
    //         return this.http.post<ApiResponse<LoginDTO>>(
    //             `${environment.apiBaseUrl}/Employee/Login`, payload, {withCredentials: true}
    //         );
    //     }
 
}
 
 