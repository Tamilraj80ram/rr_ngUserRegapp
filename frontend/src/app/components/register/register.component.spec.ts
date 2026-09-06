import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService, UserResponse } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('form is invalid with a short full name', () => {
    component.form.setValue({
      fullName: 'J',
      email: 'jane@example.com',
      password: 'secret123',
      confirmPassword: 'secret123'
    });

    expect(component.form.valid).toBeFalse();
  });

  it('form is invalid with a malformed email', () => {
    component.form.setValue({
      fullName: 'Jane Doe',
      email: 'not-an-email',
      password: 'secret123',
      confirmPassword: 'secret123'
    });

    expect(component.form.valid).toBeFalse();
  });

  it('form is invalid with a short password', () => {
    component.form.setValue({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: '123',
      confirmPassword: '123'
    });

    expect(component.form.valid).toBeFalse();
  });

  it('detects mismatched passwords', () => {
    component.form.setValue({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
      confirmPassword: 'different123'
    });

    expect(component.passwordsMismatch).toBeTrue();
  });

  it('does not call AuthService.register when the form is invalid', () => {
    component.submit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('does not call AuthService.register when passwords mismatch', () => {
    component.form.setValue({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
      confirmPassword: 'different123'
    });

    component.submit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('calls AuthService.register with valid form data and shows a success message', () => {
    const mockUser: UserResponse = {
      id: '1',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      createdAtUtc: new Date().toISOString()
    };
    authServiceSpy.register.and.returnValue(of(mockUser));

    component.form.setValue({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
      confirmPassword: 'secret123'
    });

    component.submit();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123'
    });
    expect(component.successMessage).toContain('Account created');
    expect(component.submitting).toBeFalse();
  });

  it('shows an error message when registration fails', () => {
    authServiceSpy.register.and.returnValue(throwError(() => new Error('Email already exists')));

    component.form.setValue({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
      confirmPassword: 'secret123'
    });

    component.submit();

    expect(component.errorMessage).toBe('Email already exists');
    expect(component.submitting).toBeFalse();
  });

  it('navigates to /login after a successful registration', (done) => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    const mockUser: UserResponse = {
      id: '1',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      createdAtUtc: new Date().toISOString()
    };
    authServiceSpy.register.and.returnValue(of(mockUser));

    component.form.setValue({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      password: 'secret123',
      confirmPassword: 'secret123'
    });

    component.submit();

    setTimeout(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      done();
    }, 1300);
  });
});
