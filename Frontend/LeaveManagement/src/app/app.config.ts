import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations'; // Import for animations
import { provideToastr } from 'ngx-toastr'; // Import for Toastr
import { routes } from './app.routes';
import { ReactiveFormsModule } from '@angular/forms'; 
import { EmployeeAuthGuard } from './core/guards/employee-auth.guards';
import { ManagerAuthGuard } from './core/guards/manager-auth.guards';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(), // Required for Toastr animations
    EmployeeAuthGuard, // Registering Employee Auth Guard
    ManagerAuthGuard, // Registering Manager Auth Guard
    provideToastr({
      timeOut: 3000, // Duration for the toast message in milliseconds
      positionClass: 'toast-top-right', // Position of the toast message on the screen
      preventDuplicates: true, // Prevents multiple identical toasts from showing up
      progressBar: true, // Shows a progress bar indicating time remaining
      closeButton: true, // Shows a close button on the toast
    }), // Toastr configuration
    importProvidersFrom(ReactiveFormsModule)
  ]
};
