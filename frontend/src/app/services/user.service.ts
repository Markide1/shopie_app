import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `http://localhost:3000/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  updateProfile(data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, data);
  }

  deactivateAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deactivate`);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }
}