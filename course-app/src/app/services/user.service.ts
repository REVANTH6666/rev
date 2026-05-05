import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// 🔥 User Interface (BEST PRACTICE)
export interface User {
  id: number;
  name: string;
  email: string;
  course: string;
  age: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://127.0.0.1:5000/users';

  constructor(private http: HttpClient) {}

  // 🔥 GET USERS
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  // 🔥 DELETE USER
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // 🔥 UPDATE USER
  updateUser(user: User): Observable<any> {
    return this.http.put(`${this.apiUrl}/${user.id}`, user);
  }
}