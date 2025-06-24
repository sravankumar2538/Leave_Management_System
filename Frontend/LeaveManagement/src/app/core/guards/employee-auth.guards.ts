import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../features/Auth/auth.login.service'; // Assuming this is the correct path
import { filter, take, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EmployeeAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log("EmployeeAuthGuard: canActivate called.");
    return this.authService.authStatusReady$.pipe(
      filter(isReady => isReady), // Wait until auth status is ready
      take(1), // Take only the first value after it's ready
      map(() => {
        const user = this.authService.getCurrentUser();
        console.log("EmployeeAuthGuard: User after authStatusReady:", user ? user.role : 'null');

        if (!user) {
          console.log("EmployeeAuthGuard: User not authenticated, redirecting to login.");
          return this.router.createUrlTree(['/login']);
        }

        // Allow access to employee routes if not a manager
        if (user.role?.toLowerCase() !== 'manager') {
          console.log("EmployeeAuthGuard: User is not a manager, allowing access.");
          return true;
        }

        // If the user is a manager, redirect to manager dashboard
        console.log("EmployeeAuthGuard: User is a manager, redirecting to manager dashboard.");
        return this.router.createUrlTree(['/manager/dashboard']);
      })
    );
  }
}