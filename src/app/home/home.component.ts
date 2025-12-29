import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importante para ngModel
import { Router } from '@angular/router';
import { DbService, User } from '../services/db.service';

// Declaramos jQuery para que no de error al usar OwlCarousel
declare var $: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  
  // Datos para los formularios
  loginData = { email: '', password: '' };
  registerData = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'normal' as 'normal'|'admin' };

  constructor(private db: DbService, private router: Router) {}

  ngAfterViewInit() {
    // Inicializar carruseles de la plantilla (Owl Carousel)
    this.initCarousels();
  }

  onLogin() {
    const user = this.db.login(this.loginData.email, this.loginData.password);
    if (user) {
      if (user.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        alert('¡Login Exitoso! (La página de usuario normal se creará después)');
      }
    } else {
      alert('Correo o contraseña incorrectos');
    }
  }

  onRegister() {
    if (this.registerData.password !== this.registerData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const newUser: User = {
      firstName: this.registerData.firstName,
      lastName: this.registerData.lastName,
      email: this.registerData.email,
      password: this.registerData.password,
      role: this.registerData.role
    };

    if (this.db.register(newUser)) {
      alert('Registro exitoso. Ahora puedes iniciar sesión.');
      this.registerData = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'normal' }; // Limpiar
    } else {
      alert('Este correo ya está registrado.');
    }
  }

  initCarousels() {
    if ($('.owl-media').length) {
      $('.owl-media').owlCarousel({
        loop: true,
        margin: 30,
        nav: true,
        dots: true,
        autoplay: true,
        smartSpeed: 1000,
        responsive: {
          0: { items: 1 },
          768: { items: 2 },
          992: { items: 3 }
        }
      });
    }
  }
}