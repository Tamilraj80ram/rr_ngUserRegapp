import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService, UserResponse } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('form is invalid with a malformed email', () => {
    component.form.setValue({ email: 'not-an-email', password: 'secret123' });

    expect(component.form.valid).toBeFalse();
  });

  it('form is valid with a proper email and non-empty password', () => {
    component.form.setValue({ email: 'jane@example.com', password: 'secret123' });

    expect(component.form.valid).toBeTrue();
  });

  it('does not call AuthService.login when the form is invalid', () => {
    component.submit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('calls AuthService.login and stores the returned user on success', () => {
    const mockUser: UserResponse = {
      id: '1',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      createdAtUtc: new Date().toISOString()
    };
    authServiceSpy.login.and.returnValue(of(mockUser));

    component.form.setValue({ email: 'jane@example.com', password: 'secret123' });
    component.submit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'secret123'
    });
    expect(component.loggedInUser).toEqual(mockUser);
    expect(component.submitting).toBeFalse();
  });

  it('shows an error message when login fails', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Invalid email or password.')));

    component.form.setValue({ email: 'jane@example.com', password: 'wrong' });
    component.submit();

    expect(component.errorMessage).toBe('Invalid email or password.');
    expect(component.loggedInUser).toBeNull();
    expect(component.submitting).toBeFalse();
  });
});
