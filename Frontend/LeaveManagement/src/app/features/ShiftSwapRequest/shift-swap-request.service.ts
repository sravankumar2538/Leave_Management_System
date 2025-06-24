import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.developement";
import { ApiResponse } from "../../shared/api-response.interface";
import {PostShiftSwapRequestDto} from "./Dtos/PostShiftSwapRequestDto";
import { ShiftSwapRequestResponseDto } from './Dtos/ShiftSwapRequestResponseDto';
import { UpdateShiftSwapRequestDto } from './Dtos/UpdateShiftSwapRequestDto';

@Injectable({
  providedIn: 'root'
})
export class ShiftSwapRequestService {

  constructor(private readonly http: HttpClient) { }

  ShiftSwapStatus(): Observable<ApiResponse<ShiftSwapRequestResponseDto[]>> {
    return this.http.get<ApiResponse<ShiftSwapRequestResponseDto[]>>(
        `${environment.apiBaseUrl}/ShiftSwapRequest/EmployeeStatusByEmployeeId`,
        { withCredentials: true }
    );
  }

  AllShiftSwapRequestsByManager(): Observable<ApiResponse<ShiftSwapRequestResponseDto[]>> {
    // Replace with your actual backend endpoint to get all pending requests for a manager
    return this.http.get<ApiResponse<ShiftSwapRequestResponseDto[]>>(
      `${environment.apiBaseUrl}/ShiftSwapRequest/RequestsByManagerId`, // Example endpoint
      { withCredentials: true }
    );
  }

  RejectLeaveRequest(shiftRequestId: string): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`
        ${environment.apiBaseUrl}/ShiftSwapRequest/RejectShiftRequest?ShiftSwapRequestId=${shiftRequestId}`,{}, { withCredentials: true });
    }
  ApproveLeaveRequest(shiftRequestId: string): Observable<ApiResponse<string>> {
        return this.http.put<ApiResponse<string>>(`
            ${environment.apiBaseUrl}/ShiftSwapRequest/ApproveShiftRequest?ShiftSwapRequestId=${shiftRequestId}`,{}, { withCredentials: true });
        }

  updateShiftSwapRequest(updateDto: UpdateShiftSwapRequestDto): Observable<ApiResponse<string>> {
    // The error points to this method signature.
    // Ensure your backend endpoint for update is correct (e.g., PUT /ShiftSwapRequest/Update)
    return this.http.put<ApiResponse<string>>(
      `${environment.apiBaseUrl}/ShiftSwapRequest/ByEmployeeId?ShiftSwapRequestId=${updateDto.shiftRequestId}`, // Adjust URL to your specific backend endpoint if needed
      updateDto,
      { withCredentials: true } // Include if your API requires cookies/credentials
    );
  }

  deleteShiftSwapRequest(shiftRequestId: string): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(
      `${environment.apiBaseUrl}/ShiftSwapRequest/CancelRequestByEmployeeId?ShiftSwapRequestId=${shiftRequestId}`,{},{ withCredentials: true });
  }
  postShiftSwapRequest(payload: PostShiftSwapRequestDto): Observable<ApiResponse<string>> {
      return this.http.post<ApiResponse<string>>(`
          ${environment.apiBaseUrl}/ShiftSwapRequest/ByEmployeeId`, payload, { withCredentials: true }
 
      );
    }
}
