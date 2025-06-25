import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { HomeComponent } from './components/home/home.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { CustomerDashboardComponent } from './components/customer/customer-dashboard/customer-dashboard.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { AdminOrdersComponent } from './components/admin/orders/admin-orders.component';
import { AdminProductFormComponent } from './components/admin/products/admin-product-form.component';
import { AdminProductsComponent } from './components/admin/products/admin-products.component';
import { AdminUsersComponent } from './components/admin/users/admin-users.component';
import { AdminOrderDetailsComponent } from './components/admin/orders/admin-order-details.component';
import { CustomerProductListComponent } from './components/customer/product-list/customer-product-list.component';
import { ProfileComponent } from './components/customer/profile/profile.component';
import { CustomerCartComponent } from './components/customer/cart/customer-cart.component';
import { CustomerOrdersComponent } from './components/customer/orders/customer-orders.component';
import { CustomerOrderDetailsComponent } from './components/customer/orders/customer-order-details.component';
import { CustomerCheckoutComponent } from './components/customer/checkout/customer-checkout.component';
import { GuestCartComponent } from './components/guest/cart/guest-cart.component';


export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'product-list', component: ProductListComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'cart', component: GuestCartComponent }
    ]
  },
  {
    path: 'customer',
    component: AuthLayoutComponent,
    canActivate: [authGuard],
    data: { roles: ['CUSTOMER'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CustomerDashboardComponent },
      { path: 'products', component: CustomerProductListComponent },
      { path: 'cart', component: CustomerCartComponent },
      { path: 'orders', component: CustomerOrdersComponent },
      { path: 'orders/:id', component: CustomerOrderDetailsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'checkout', component: CustomerCheckoutComponent }
    ]
  },
  {
    path: 'admin',
    component: AuthLayoutComponent,
    canActivate: [authGuard, adminGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'products/new', component: AdminProductFormComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'orders/:id', component: AdminOrderDetailsComponent },
      { path: 'users', component: AdminUsersComponent }
    ]
  },
  { path: '**', redirectTo: ' ' }
];
