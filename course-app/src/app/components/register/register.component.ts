import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;

  showPassword = false;
  showConfirmPassword = false;

  isLoading = false;

  courses = ['BCA','BBA','B.Com','B.Tech','MBA','MCA','B.Sc','M.Sc'];

  private apiUrl = 'http://127.0.0.1:5000/register';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/@gmail\.com$/)
      ]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      course: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1)]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  onSubmit() {

    if (this.registerForm.invalid) {
      Swal.fire('Error', 'Please fill all fields correctly', 'error');
      return;
    }

    const formData = this.registerForm.value;

    if (formData.password !== formData.confirmPassword) {
      Swal.fire('Error', 'Passwords do not match', 'error');
      return;
    }

    if (this.isLoading) return;
    this.isLoading = true;

    const data = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
      course: formData.course,
      age: Number(formData.age)
    };

    console.log("📤 Register Data:", data); // 🔥 debug

    this.http.post<any>(this.apiUrl, data).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.success) {
          Swal.fire('Success 🎉', res.message || 'Registration successful!', 'success')
            .then(() => this.router.navigate(['/login']));
        } else {
          Swal.fire('Error', res.message || 'Registration failed ❌', 'error');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error("❌ Register Error:", err);

        Swal.fire('Error', err?.error?.message || 'Server error ⚠️', 'error');
      }
    });
  }
}