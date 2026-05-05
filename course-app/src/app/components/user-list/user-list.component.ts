import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  users: any[] = [];
  editingId: number | null = null;
  isSaving = false;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log("🔥 COMPONENT LOADED");

    // 🔐 EXTRA SAFETY CHECK
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      this.router.navigate(['/login']);
      return;
    }

    this.fetchUsers();
  }

  fetchUsers() {
    console.log("🔥 CALLING API...");

    this.userService.getUsers().subscribe({
      next: (data: any) => {
        this.zone.run(() => {
          this.users = Array.isArray(data) ? data : [];
          this.users = [...this.users];
          this.cdr.detectChanges();
        });
      },
      error: () => {
        Swal.fire('Error', 'Failed to load users ❌', 'error');
      }
    });
  }

  trackById(index: number, user: any) {
    return user.id;
  }

  enableEdit(id: number) {
    this.editingId = id;
  }

  cancelEdit() {
    this.editingId = null;
    this.fetchUsers();
  }

  update(user: any) {
    if (this.isSaving) return;
    this.isSaving = true;

    this.userService.updateUser(user).subscribe({
      next: () => {
        this.isSaving = false;
        this.editingId = null;
        this.fetchUsers();
        Swal.fire('Saved!', 'Updated successfully 🚀', 'success');
      },
      error: () => {
        this.isSaving = false;
        Swal.fire('Error', 'Update failed ❌', 'error');
      }
    });
  }

  delete(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Delete this user?',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {

      if (result.isConfirmed) {
        this.userService.deleteUser(id).subscribe({
          next: () => {
            this.fetchUsers();
            Swal.fire('Deleted!', 'User removed', 'success');
          },
          error: () => {
            Swal.fire('Error', 'Delete failed ❌', 'error');
          }
        });
      }

    });
  }

  // 🔙 Back to Login
  goToLogin() {
    this.router.navigate(['/login']);
  }

  // 🚪 Logout (🔥 FINAL FIX)
  logout() {
    localStorage.removeItem('isLoggedIn'); // 🔐 only remove login key
    this.router.navigate(['/login']);
  }
}