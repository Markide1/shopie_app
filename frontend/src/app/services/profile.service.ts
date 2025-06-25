import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `https://localhost:3000/users/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfile(data: UpdateProfileDto): Observable<Profile> {
    return this.http.put<Profile>(this.apiUrl, data, {
      headers: this.getAuthHeaders()
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }
}