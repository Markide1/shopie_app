import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: Array<{ imageUrl: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) {}

  getProducts(search?: string): Observable<Product[]> {
    const url = search ? `${this.apiUrl}?search=${search}` : this.apiUrl;
    return this.http.get<Product[]>(url);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(formData: FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, formData);
  }

  updateProduct(id: string, formData: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}