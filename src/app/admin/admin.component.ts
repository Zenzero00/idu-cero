import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DbService, AppColors } from '../service/db.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  
  colors: AppColors = { primary: '', secondary: '', accent: '', neutral: '' };
  currentUser: any = null;

  constructor(private db: DbService, private router: Router) {}

  ngOnInit() {
    // 1. Verificar seguridad (Solo Admin puede entrar)
    this.currentUser = this.db.getCurrentUser();
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      alert('Acceso Denegado: Debes ser administrador.');
      this.router.navigate(['/']);
      return;
    }

    // 2. Cargar los colores actuales
    this.colors = this.db.getColors();
  }

  saveChanges() {
    this.db.saveColors(this.colors);
    
    // Forzar actualización del iframe de vista previa
    const iframe = document.getElementById('site-preview') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src; // Recargar iframe para ver cambios
    }

    alert('¡Colores guardados y aplicados!');
  }

  logout() {
    this.db.logout();
    this.router.navigate(['/']);
  }
}