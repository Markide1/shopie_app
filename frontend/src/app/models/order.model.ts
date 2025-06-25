export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: { imageUrl: string }[];
  };
}

export interface Address {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  items: OrderItem[];
  orderItems: OrderItem[]; 
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: 'CARD' | 'CASH';
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  cartIds: string[];
  address: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod?: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

export interface RecentOrder {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}