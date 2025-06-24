import { Component } from '@angular/core';
import { Router } from '@angular/router'; // Import Router for navigation
import { CommonModule } from '@angular/common'; // Import CommonModule for basic directives
import { AuthService } from '../Auth/auth.login.service';
import { ApiResponse } from '../../shared/api-response.interface';
import { HttpErrorResponse } from '@angular/common/http';
 
@Component({
  selector: 'app-error-page',
  imports: [CommonModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.css'
})
export class ErrorPageComponent {
 
 
  constructor(private readonly router: Router,private readonly authService:AuthService) {}
 
  RemoveTokenNavigateToLogin(): void {
    this.authService.logout().subscribe({
      next: (response : ApiResponse<string>) => {
      },
      error: (error: HttpErrorResponse) => {
      }
    })
    this.router.navigate(['/login']);
  }
}
 