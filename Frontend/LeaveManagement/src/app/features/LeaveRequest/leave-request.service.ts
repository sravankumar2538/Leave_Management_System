import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ApiResponse } from "../../shared/api-response.interface";
import { PostLeaveRequestDto } from "./dtos/PostLeaveRequestDto";
import { LeaveRequestStatusResponseDto } from "./dtos/LeaveRequestStatusResponseDto";
import { environment } from "../../../environments/environment.developement";
import { Injectable } from "@angular/core";
import {UpdateLeaveRequestDto} from "./dtos/UpdateLeaveRequestDto"

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestService {

  constructor(private readonly http: HttpClient) { }
  GetEmployeeStatus(): Observable<ApiResponse<LeaveRequestStatusResponseDto[]>> {
    return this.http.get<ApiResponse<LeaveRequestStatusResponseDto[]>>(
        `${environment.apiBaseUrl}/LeaveRequest/EmployeeStatus`,
        { withCredentials: true }
    );
  }
 
  GetPendingRequestsByManager(): Observable<ApiResponse<LeaveRequestStatusResponseDto[]>> {
    return this.http.get<ApiResponse<LeaveRequestStatusResponseDto[]>>(
        `${environment.apiBaseUrl}/LeaveRequest/PendingRequestsByManager`, { withCredentials: true });
  }
 
  postLeaveRequest(payload: PostLeaveRequestDto): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`
        ${environment.apiBaseUrl}/LeaveRequest`, payload, { withCredentials: true }
 
    );
  }
  RejectLeaveRequest(leaveId: string): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`
        ${environment.apiBaseUrl}/LeaveRequest/RejectLeave?LeaveId=${leaveId}`,{}, { withCredentials: true });
    }
  ApproveLeaveRequest(leaveId: string): Observable<ApiResponse<string>> {
        return this.http.put<ApiResponse<string>>(`
            ${environment.apiBaseUrl}/LeaveRequest/ApproveLeave?LeaveId=${leaveId}`,{}, { withCredentials: true });
        }
 
        updateLeaveRequest(updateDto: UpdateLeaveRequestDto): Observable<ApiResponse<string>> {
          // Correctly access leaveId from the updateDto object
          return this.http.put<ApiResponse<string>>(
            `${environment.apiBaseUrl}/LeaveRequest?leaveId=${updateDto.leaveId}`, // Use updateDto.leaveId
            updateDto, // Pass the entire updateDto as the request body
            { withCredentials: true }
          );
        }
 
    deleteLeaveRequest(leaveId: string): Observable<ApiResponse<string>> {
      return this.http.put<ApiResponse<string>>(
        `${environment.apiBaseUrl}/LeaveRequest/CancelLeaveRequest?LeaveRequestId=${leaveId}`,{},
        { withCredentials: true } // Options as the second argument
      );
    }
}
