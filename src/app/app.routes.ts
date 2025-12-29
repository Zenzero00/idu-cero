import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },     // Ruta raíz -> Home (Mexant)
  { path: 'admin', component: AdminComponent }, // Ruta admin -> Panel
  { path: '**', redirectTo: '' }              // Cualquier otra cosa -> Home
];