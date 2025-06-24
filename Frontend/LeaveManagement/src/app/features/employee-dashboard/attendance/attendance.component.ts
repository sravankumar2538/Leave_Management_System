import { Component, Inject, ViewChild, OnDestroy } from '@angular/core';
import { AttendanceService } from '../../Attendance/attendance.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';
import { PopupComponent } from '../../../shared/popup/popup.component';
import { Subject, EMPTY } from 'rxjs';
import { takeUntil, switchMap, tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [PopupComponent],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css'
})
export class AttendanceComponent implements OnDestroy {

  private readonly attendanceService: AttendanceService;
  private readonly destroy$ = new Subject<void>();
  // Use a single subject to trigger popup, and pass the action type
  private readonly confirmationRequest$ = new Subject<'clockIn' | 'clockOut'>();

  @ViewChild('confirmPopup') confirmPopup!: PopupComponent;

  constructor(
    @Inject(AttendanceService) attendanceService: AttendanceService,
    private readonly toastr: ToastrService
  ) {
    this.attendanceService = attendanceService;

    this.confirmationRequest$.pipe(
      takeUntil(this.destroy$),
      switchMap((actionType) => {
        const message = `Confirm to continue with the ${actionType === 'clockIn' ? 'Clock-In' : 'Clock-Out'}?`;
        this.confirmPopup.show(message);

        return this.confirmPopup.confirmed.pipe(
          switchMap((isConfirmed: boolean) => {
            if (!isConfirmed) {
              // Show toast specific to the action type that was cancelled
              this.toastr.info(`${actionType === 'clockIn' ? 'Clock-In' : 'Clock-Out'} cancelled.`, 'Info');
              return EMPTY; // Stop the flow if cancelled
            } else {
              // Proceed with the action
              const apiCall = actionType === 'clockIn'
                ? this.attendanceService.Clockin()
                : this.attendanceService.Clockout();

              return apiCall.pipe(
                tap(response => {
                  if (response.isSuccess) {
                    this.toastr.success(response.message, 'Success');
                  } else {
                    this.toastr.error(response.message || `${actionType === 'clockIn' ? 'Clock-in' : 'Clock-out'} failed due to an unexpected reason.`, 'Error');
                  }
                }),
                catchError((error: HttpErrorResponse) => {
                  this.handleHttpError(error);
                  return EMPTY; // Return EMPTY after handling the error
                })
              );
            }
          })
        );
      })
    ).subscribe(); // No separate subscribe needed here as tap and catchError handle side effects
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClockIn() {
    this.confirmationRequest$.next('clockIn');
  }

  onClockOut() {
    this.confirmationRequest$.next('clockOut');
  }

  private handleHttpError(error: HttpErrorResponse): void {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    if (error.error && typeof error.error === 'object' && 'message' in error.error) {
      errorMessage = (error.error as any).message;
    } else if (error.status === 0) {
      errorMessage = 'Network error: Could not connect to the server.';
    }
    this.toastr.error(errorMessage, 'Error');
  }
}