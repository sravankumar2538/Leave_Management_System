import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.developement";
import { ApiResponse } from "../../shared/api-response.interface";
import { EmployeeShiftsResponseDto } from "./dtos/EmployeeShiftResponseDto";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AssignShiftRequestDTO } from "./dtos/AssignShiftRequestDto";
import {UpdateShiftRequestDto} from "../Shifts/dtos/UpdateShiftAssignDto";

 
@Injectable({
  providedIn: 'root'
})

export class EmployeeShiftService {
    constructor(private readonly http: HttpClient) {}
 
    ShiftsOfAnEmployee(): Observable<ApiResponse<EmployeeShiftsResponseDto[]>> {
      return this.http.get<ApiResponse<EmployeeShiftsResponseDto[]>>(`${environment.apiBaseUrl}/Shifts/ByEmployeeId`,{ withCredentials: true });
    }
    AllEmployeeShiftsByManager(): Observable<ApiResponse<EmployeeShiftsResponseDto[]>> {
          return this.http.get<ApiResponse<EmployeeShiftsResponseDto[]>>(
              `${environment.apiBaseUrl}/Shifts/AllEmployeesByManagerId`,
              { withCredentials: true }
          );
    }
    AssignShifts(payload: AssignShiftRequestDTO): Observable<ApiResponse<string>> {
      return this.http.post<ApiResponse<string>>(
        `${environment.apiBaseUrl}/Shifts/AssignShifts`, // Your API endpoint
        payload,
        { withCredentials: true } // Important for cookies/authentication
      );
    }
    UpdateShiftsByManager(payload: UpdateShiftRequestDto): Observable<ApiResponse<string>> {
      return this.http.put<ApiResponse<string>>(
        `${environment.apiBaseUrl}/Shifts/AssignShifts`, payload, { withCredentials: true }
      );
    }
}
