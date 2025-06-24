import { Component, OnInit } from '@angular/core';
import { LoginDTO } from '../../Auth/Dtos/login-payload.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from "../../Auth/auth.login.service";
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr'; // Import ToastrService
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../../shared/api-response.interface';
import { LoginResponseDTO } from '../Dtos/LoginResponseDTO';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], // FormsModule is crucial for ngModel and template-driven forms
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toastr: ToastrService,// Inject ToastrService,
    private readonly activatedRoute: ActivatedRoute // Inject ActivateRoute to access query parameters
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['expired']) {
        this.toastr.error('Your session has expired. Please log in again.', 'Session Expired', {
          timeOut: 5000,
        });
      }
    });
  }

  loginRequest: LoginDTO = {
    email: '',
    password: '',
    role: '',
    message: ''
  };

  onSubmit() {
    // The submit button is disabled if the form is invalid,
    // so this method will only be called if the form is valid.
    this.authService.login(this.loginRequest).subscribe({
      next: (response: ApiResponse<LoginResponseDTO>) => {
        if (response.isSuccess) {
          this.toastr.success(response.data.message, 'Success'); // Display success toast
          this.authService.saveRole(response.data.role); // Save the role in the AuthService
          // Redirect based on the role 
          if (response.data.role == 'Manager') {
            this.router.navigate(['/manager']);
          } else {
            this.router.navigate(['/employee']);
          }
        }
        else{
          this.toastr.error(response.data.message, 'Error'); // Display success toast

        }
      },
      error: (error: HttpErrorResponse) => { // Explicitly type error as HttpErrorResponse

        // Check if the error object has the expected structure
        if (error.error && typeof error.error === 'object' && error.error.message) {
          this.toastr.error(error.error.message, 'Error'); // Display the specific error message from the backend
        } else if (error.status == 400) {
          // Fallback for unexpected error structures or network errors
          this.toastr.error('Invalid login credentials', 'Login Failed');
        }
       else {
          this.toastr.error('Invalid login credentials', 'Login Failed');
        }
      }
    });
  }
  

}






