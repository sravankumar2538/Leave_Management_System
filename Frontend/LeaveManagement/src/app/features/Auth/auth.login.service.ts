import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, tap, catchError, of, finalize, throwError } from "rxjs";
import { ApiResponse } from "../../shared/api-response.interface";
import { environment } from "../../../environments/environment.developement";
import { LoginDTO } from "../Auth/Dtos/login-payload.dto";
import { LoginResponseDTO } from "../Auth/Dtos/LoginResponseDTO";

export interface CurrentUser {
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly currentUserSubject: BehaviorSubject<CurrentUser | null> = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$: Observable<CurrentUser | null> = this.currentUserSubject.asObservable();
  private readonly _authStatusReady = new BehaviorSubject<boolean>(false);
  public authStatusReady$ = this._authStatusReady.asObservable();

  constructor(private readonly http: HttpClient) {
    console.log("AuthService: Constructor called.");
    this.loadUserRoleOnAppInit(); // Call a dedicated method for initial load
  }

  // New method to handle initial role loading on application startup
  loadUserRoleOnAppInit(): void {
    console.log("AuthService: Attempting to load user role on app initialization.");
    this.getRole().pipe(
      tap((response: ApiResponse<string>) => {
        // --- MODIFICATION START ---
        // For getRole(), the role is in the 'message' field when 'data' is null based on your backend response.
        if (response && response.isSuccess && response.message) {
          console.log("AuthService: Initial role fetched successfully from message:", response.message);
          this.saveRole(response.message); // Save the role from the 'message' field
        } else {
          console.log("AuthService: Initial role fetch did not return success or a valid role in message. User set to null.");
          this.currentUserSubject.next(null);
        }
        // --- MODIFICATION END ---
      }),
      catchError((error) => {
        console.error("AuthService: Error fetching role during app init:", error);
        this.currentUserSubject.next(null); // Ensure user is null on error
        return of(null); // Return observable of null to complete the stream gracefully
      }),
      finalize(() => {
        this._authStatusReady.next(true); // Signal that auth status is ready after the attempt
        console.log("AuthService: Initial role fetch complete, authStatusReady set to true.");
      })
    ).subscribe(); // Subscribe to trigger the observable
  }

  login(payload: LoginDTO): Observable<ApiResponse<LoginResponseDTO>> {
    console.log("AuthService: Attempting login for user.");
    return this.http.post<ApiResponse<LoginResponseDTO>>(
      `${environment.apiBaseUrl}/Employee/login`, payload, { withCredentials: true }
    ).pipe(
      tap((response: ApiResponse<LoginResponseDTO>) => {
        if (response && response.data && response.data.success && response.data.role) {
          console.log("AuthService: Login successful. Saving role:", response.data.role);
          this.saveRole(response.data.role);
          this._authStatusReady.next(true); // Explicitly set ready after login as well
          console.log("AuthService: Login successful, authStatusReady set to true.");
        } else {
          console.warn("AuthService: Login response indicates failure or missing data.");
          this.currentUserSubject.next(null); // Clear user on unsuccessful login response
          this._authStatusReady.next(true); // Ensure auth status is ready even if login fails
        }
      }),
      catchError(error => {
        console.error("AuthService: Login failed due to API error:", error);
        this.currentUserSubject.next(null); // Clear user on error
        this._authStatusReady.next(true); // Ensure auth status is ready even on error
        return throwError(() => new Error("Login failed, please try again."));
      })
    );
  }

  logout(): Observable<ApiResponse<string>> {
    console.log("AuthService: Attempting logout.");
    return this.http.post<ApiResponse<string>>(
      `${environment.apiBaseUrl}/Employee/Logout`, {}, { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response && response.isSuccess) {
          console.log("AuthService: Logout successful from server.");
        } else {
          console.warn("AuthService: Logout response indicates server-side failure:", response);
        }
      }),
      finalize(() => {
        // Always clear local state on logout, regardless of server response
        console.log("AuthService: Clearing local user session after logout attempt.");
        this.clearUserSession();
        this._authStatusReady.next(true); // Auth status is ready (unauthenticated)
      }),
      catchError(error => {
        console.error("AuthService: Error during logout API call:", error);
        // Still clear session even if API call fails
        this.clearUserSession();
        this._authStatusReady.next(true);
        return throwError(() => new Error("Logout failed."));
      })
    );
  }

  getCurrentUser(): CurrentUser | null {
    const user = this.currentUserSubject.value;
    console.log("AuthService: getCurrentUser called. Current user:", user ? user.role : 'null');
    return user;
  }

  isLoggedIn(): boolean {
    const loggedIn = this.currentUserSubject.value !== null;
    console.log("AuthService: isLoggedIn called. Status:", loggedIn);
    return loggedIn;
  }

  saveRole(role: string): void {
    console.log("AuthService: Saving role to BehaviorSubject:", role);
    this.currentUserSubject.next({ role });
  }

  getRole(): Observable<ApiResponse<string>> {
    console.log("AuthService: Making API call to getRole.");
    return this.http.get<ApiResponse<string>>(
      `${environment.apiBaseUrl}/Employee/getRole`, { withCredentials: true }
    );
  }

  getUserRole(): CurrentUser | null {
    console.log("AuthService: getUserRole called. Returning current user value.");
    return this.currentUserSubject.value;
  }

  clearUserSession(): void {
    console.log("AuthService: clearUserSession called. Resetting user and auth status.");
    this.currentUserSubject.next(null);
    this._authStatusReady.next(false); // Reset to false until a new role is determined
  }

  hasRole(role: string): boolean {
    const currentUser = this.getCurrentUser();
    const hasRole = currentUser !== null && currentUser.role === role;
    console.log(`AuthService: hasRole(${role}) called. Result: ${hasRole}`);
    return hasRole;
  }
}



