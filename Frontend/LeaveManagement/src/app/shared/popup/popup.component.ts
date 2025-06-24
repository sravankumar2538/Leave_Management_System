import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for *ngIf

@Component({
  selector: 'app-popup',
  standalone: true, // Mark as standalone, common in modern Angular
  imports: [CommonModule], // Import CommonModule for directives like *ngIf
  templateUrl: './popup.component.html',
  styleUrl: './popup.component.css' // Use styleUrl for component-specific CSS
})
export class PopupComponent {
  // Input property to receive the message displayed in the popup.
  // This allows you to dynamically change the message based on the situation.
  @Input() message: string = 'Are you sure you want to proceed?';

  // Output event emitter that will emit a boolean value (true for OK, false for Cancel).
  // Parent components can subscribe to this event to know the user's choice.
  @Output() confirmed = new EventEmitter<boolean>();

  // Property to control the visibility of the popup.
  // Set to `true` to show the popup, `false` to hide it.
  isVisible: boolean = false;

  constructor() { }

  /**
   * Shows the confirmation popup.
   * Optionally takes a message to display. If no message is provided,
   * it uses the default or previously set message.
   * @param msg The message to display in the popup.
   */
  show(msg?: string): void {
    if (msg) {
      this.message = msg;
    }
    this.isVisible = true;
  }

  /**
   * Hides the confirmation popup.
   */
  hide(): void {
    this.isVisible = false;
  }

  /**
   * Handler for the "OK" button click.
   * Emits `true` to indicate confirmation and hides the popup.
   */
  onConfirm(): void {
    this.confirmed.emit(true); // Emit true for confirmation
    this.hide(); // Hide the popup
  }

  /**
   * Handler for the "Cancel" button click.
   * Emits `false` to indicate cancellation and hides the popup.
   */
  onCancel(): void {
    this.confirmed.emit(false); // Emit false for cancellation
    this.hide(); // Hide the popup
  }
}
