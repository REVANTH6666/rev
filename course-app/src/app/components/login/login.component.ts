import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  // ================= LOGIN =================
  loginForm: FormGroup;
  submitted = false;
  showPassword = false;

  showOtpBox = false;
  otp: string = '';

  isOtpSent = false;
  isLoading = false;

  private loginUrl = 'http://127.0.0.1:5000/login';
  private verifyUrl = 'http://127.0.0.1:5000/verify-otp';
  private resendUrl = 'http://127.0.0.1:5000/resend-otp';

  // ================= FORGOT PASSWORD =================
  isForgotMode: boolean = false;

  forgotEmail: string = '';
  forgotOtp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  forgotOtpSent: boolean = false;
  forgotOtpVerified: boolean = false;

  private baseUrl = 'http://127.0.0.1:5000';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, this.gmailValidator]],
      password: ['', Validators.required]
    });

    this.loginForm.get('email')?.valueChanges.subscribe(() => {
      this.showOtpBox = false;
      this.isOtpSent = false;
      this.otp = '';
    });
  }

  get f() { return this.loginForm.controls; }

  gmailValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value && !value.endsWith('@gmail.com')) {
      return { gmail: true };
    }
    return null;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  openForgotMode() {
    this.isForgotMode = true;
    this.showOtpBox = false;
    this.isOtpSent = false;
    this.otp = '';
  }

  backToLoginMode() {
    this.isForgotMode = false;
    this.forgotOtpSent = false;
    this.forgotOtpVerified = false;
    this.forgotOtp = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  // ================= LOGIN =================
  onLogin() {

    this.submitted = true;

    if (this.loginForm.invalid) {
      Swal.fire('Error', 'Enter valid details ❗', 'error');
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const api = this.isOtpSent ? this.resendUrl : this.loginUrl;

    this.http.post<any>(api, this.loginForm.value).subscribe({

      next: (res) => {
        this.isLoading = false;

        if (res && res.success === true) {
          this.showOtpBox = true;
          this.isOtpSent = true;

          this.cd.detectChanges();

          Swal.fire('OTP Sent 📩', 'Check your Gmail', 'success');
        } else {
          Swal.fire('Error', res?.message || 'Login failed ❌', 'error');
        }
      },

      error: () => {
        this.isLoading = false;
        Swal.fire('Error', 'Server not responding ⚠️', 'error');
      }
    });
  }

  verifyOtp() {

    if (!this.otp || this.otp.trim() === '') {
      Swal.fire('Error', 'Please enter OTP ❗', 'error');
      return;
    }

    this.http.post<any>(this.verifyUrl, {
      email: this.loginForm.value.email,
      otp: this.otp.trim()
    }).subscribe({
      next: (res) => {
        if (res.success) {

          Swal.fire({
            title: 'Success 🎉',
            text: 'Login successful',
            icon: 'success',
            timer: 1200,
            showConfirmButton: false
          });

          localStorage.setItem('isLoggedIn', 'true');
          this.router.navigate(['/users']);

        } else {
          Swal.fire('Error', res.message, 'error');
        }
      },
      error: () => {
        Swal.fire('Error', 'OTP verification failed ❌', 'error');
      }
    });
  }

  // ================= FORGOT PASSWORD =================

  sendForgotOtp() {

    if (!this.forgotEmail) {
      Swal.fire('Error', 'Enter email ❗', 'error');
      return;
    }

    if (this.isLoading) return;              // ✅ ADDED
    this.isLoading = true;                  // ✅ ADDED

    this.http.post<any>('http://127.0.0.1:5000/send-otp', {
      email: this.forgotEmail
    }).subscribe({

      next: (res) => {
        this.isLoading = false;            // ✅ ADDED

        if (res.success) {
          this.forgotOtpSent = true;

          this.cd.detectChanges();        // ✅ IMPORTANT FIX

          Swal.fire('OTP Sent 📩', 'Check your Gmail', 'success');

        } else {
          Swal.fire('Error', res.message, 'error');
        }
      },

      error: () => {
        this.isLoading = false;           // ✅ ADDED
        Swal.fire('Error', 'Server error ❌', 'error');
      }
    });
  }

  verifyForgotOtp() {

    if (!this.forgotOtp) {
      Swal.fire('Error', 'Enter OTP ❗', 'error');
      return;
    }

    if (this.isLoading) return;           // ✅ ADDED
    this.isLoading = true;               // ✅ ADDED

    this.http.post<any>('http://127.0.0.1:5000/verify-otp', {
      email: this.forgotEmail,
      otp: this.forgotOtp
    }).subscribe({

      next: (res) => {
        this.isLoading = false;          // ✅ ADDED

        if (res.success) {
          this.forgotOtpVerified = true;

          this.cd.detectChanges();      // ✅ FIX

          Swal.fire('OTP Verified ✅', 'Now set password', 'success');

        } else {
          Swal.fire('Error', res.message, 'error');
        }
      },

      error: () => {
        this.isLoading = false;         // ✅ ADDED
        Swal.fire('Error', 'Verification failed ❌', 'error');
      }
    });
  }

  resetForgotPassword() {

    if (!this.newPassword || !this.confirmPassword) {
      Swal.fire('Error', 'All fields required ❗', 'error');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      Swal.fire('Error', 'Passwords do not match ❌', 'error');
      return;
    }

    if (this.isLoading) return;          // ✅ ADDED
    this.isLoading = true;              // ✅ ADDED

    this.http.post<any>('http://127.0.0.1:5000/reset-password', {
      email: this.forgotEmail,
      newPassword: this.newPassword
    }).subscribe({

      next: (res) => {
        this.isLoading = false;        // ✅ ADDED

        if (res.success) {

          Swal.fire({
            title: 'Password Updated 🎉',
            text: 'Redirecting...',
            icon: 'success',
            timer: 1200,
            showConfirmButton: false
          });

          this.backToLoginMode();

          this.cd.detectChanges();    // ✅ FIX

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1200);

        } else {
          Swal.fire('Error', res.message, 'error');
        }
      },

      error: () => {
        this.isLoading = false;       // ✅ ADDED
        Swal.fire('Error', 'Server error ❌', 'error');
      }
    });
  }
}