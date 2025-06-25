import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderDto, DashboardStats, RecentOrder, OrderStatus } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // Admin endpoints
  getAdminOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/admin`);
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/orders/stats`);
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${orderId}`);

  }


  shipOrder(orderId: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/ship`, {});
  }

  getRecentOrders(): Observable<RecentOrder[]> {
    return this.http.get<RecentOrder[]>(`${this.apiUrl}/orders/recent`);
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/orders/${orderId}/status`, { status });
  }

  // Customer endpoints
  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders`);
  }

  createOrder(data: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, data);
  }

  confirmPayment(orderId: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/confirm-payment`, {});
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/cancel`, {});
  }

  confirmDelivery(orderId: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/orders/${orderId}/confirm-delivery`, {});
  }

}