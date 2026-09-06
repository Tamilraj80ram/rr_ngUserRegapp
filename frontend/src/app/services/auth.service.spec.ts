import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService, UserResponse } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('POSTs to /auth/register and returns the created user', () => {
      const payload = { fullName: 'Jane Doe', email: 'jane@example.com', password: 'secret123' };
      const mockResponse: UserResponse = {
        id: '1',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        createdAtUtc: new Date().toISOString()
      };

      service.register(payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });

    it('maps a 409 conflict into a friendly error message', () => {
      const payload = { fullName: 'Jane Doe', email: 'taken@example.com', password: 'secret123' };

      service.register(payload).subscribe({
        next: () => fail('expected an error'),
        error: (err: Error) => {
          expect(err.message).toContain('already exists');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/register`);
      req.flush(
        { message: 'An account with this email already exists.' },
        { status: 409, statusText: 'Conflict' }
      );
    });
  });

  describe('login', () => {
    it('POSTs to /auth/login and returns the user on success', () => {
      const payload = { email: 'jane@example.com', password: 'secret123' };
      const mockResponse: UserResponse = {
        id: '1',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        createdAtUtc: new Date().toISOString()
      };

      service.login(payload).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/login`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('maps a 401 into a friendly error message', () => {
      const payload = { email: 'jane@example.com', password: 'wrong' };

      service.login(payload).subscribe({
        next: () => fail('expected an error'),
        error: (err: Error) => {
          expect(err.message).toContain('Invalid email or password');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.flush(
        { message: 'Invalid email or password.' },
        { status: 401, statusText: 'Unauthorized' }
      );
    });

    it('maps a network error (status 0) into a "cannot reach" message', () => {
      const payload = { email: 'jane@example.com', password: 'secret123' };

      service.login(payload).subscribe({
        next: () => fail('expected an error'),
        error: (err: Error) => {
          expect(err.message).toContain('Cannot reach the UserService API');
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/login`);
      req.error(new ProgressEvent('network error'), { status: 0 });
    });
  });
});
