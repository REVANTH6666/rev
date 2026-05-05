import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { AuthGuard } from './guards/auth.guard';


export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // ✅ NEW ROUTE
  

  {
    path: 'users',
    component: UserListComponent,
    canActivate: [AuthGuard]
  },

  { path: '**', redirectTo: 'login' }
];