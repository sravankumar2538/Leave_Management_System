import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../features/Auth/auth.login.service'; // Assuming this is the correct path
import { filter, take, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ManagerAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log("ManagerAuthGuard: canActivate called.");
    return this.authService.authStatusReady$.pipe(
      filter(isReady => isReady), // Wait until auth status is ready
      take(1), // Take only the first value after it's ready
      map(() => {
        const user = this.authService.getCurrentUser();
        console.log("ManagerAuthGuard: User after authStatusReady:", user ? user.role : 'null');

        if (!user) {
          console.log("ManagerAuthGuard: User not authenticated, redirecting to login.");
          return this.router.createUrlTree(['/login']);
        }

        // Allow access to manager routes only if the user is a manager
        if (user.role?.toLowerCase() === 'manager') {
          console.log("ManagerAuthGuard: User is a manager, allowing access.");
          return true;
        }

        // If the user is authenticated but not a manager, redirect to employee dashboard (or a general unauthorized page)
        // You might want to adjust this redirect based on your application's flow for non-managers trying to access manager routes.
        console.log("ManagerAuthGuard: User is not a manager, redirecting to employee dashboard (or unauthorized).");
        return this.router.createUrlTree(['/employee/dashboard']); // Or wherever non-managers should go
      })
    );
  }
}