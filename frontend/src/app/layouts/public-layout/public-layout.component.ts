import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from "../../components/header/header.component";
import { FooterComponent } from "../../components/footer/footer.component";

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],

  template: `
    <!-- Main Content -->
     <app-header></app-header>
    <main>
      <router-outlet></router-outlet>

    </main>

    <app-footer></app-footer>
  `
})
export class PublicLayoutComponent {}