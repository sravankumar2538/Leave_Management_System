import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngIf
import { EmployeeListResponseDTO } from '../../features/Employee/Dtos/EmployeeListResponse-payload.dto'; // Ensure this DTO exists and is correctly structured

@Component({
  selector: 'app-employee-profile-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-profile-modal.component.html',
  styleUrl: './employee-profile-modal.component.css'
})
export class EmployeeProfileModalComponent {
  @Input() showModal: boolean = false; // Input to control modal visibility
  @Output() closeModal = new EventEmitter<void>(); // Output to signal modal closure

  // UPDATED: This input property will receive the single employee's details
  @Input() currentEmployeeProfile: EmployeeListResponseDTO ={
    employeeId: 0,
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    managerId: 0
  } // Accepts a single DTO or null

  onCloseClick(): void {
    this.showModal = false; // Hide the modal internally
    this.closeModal.emit(); // Emit event to notify parent component to close
  }
}