import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  createdAtUtc: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  register(payload: RegisterPayload): Observable<UserResponse> {
    return this.http
      .post<UserResponse>(`${this.baseUrl}/register`, payload)
      .pipe(catchError(this.handleError));
  }

  login(payload: LoginPayload): Observable<UserResponse> {
    return this.http
      .post<UserResponse>(`${this.baseUrl}/login`, payload)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let message = 'Something went wrong. Please try again.';

    if (error.status === 409) {
      message = error.error?.message ?? 'An account with this email already exists.';
    } else if (error.status === 401) {
      message = error.error?.message ?? 'Invalid email or password.';
    } else if (error.status === 400 && error.error?.errors) {
      const firstKey = Object.keys(error.error.errors)[0];
      message = error.error.errors[firstKey]?.[0] ?? message;
    } else if (error.status === 0) {
      message = 'Cannot reach the UserService API. Is it running?';
    }

    return throwError(() => new Error(message));
  }
}
