import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  submitting = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  get f() {
    return this.form.controls;
  }

  get passwordsMismatch(): boolean {
    const { password, confirmPassword } = this.form.value;
    return !!password && !!confirmPassword && password !== confirmPassword;
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid || this.passwordsMismatch) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const { fullName, email, password } = this.form.getRawValue();

    this.authService
      .register({ fullName: fullName!, email: email!, password: password! })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'Account created! Redirecting to login…';
          setTimeout(() => this.router.navigate(['/login']), 1200);
        },
        error: (err: Error) => {
          this.submitting = false;
          this.errorMessage = err.message;
        }
      });
  }
}
