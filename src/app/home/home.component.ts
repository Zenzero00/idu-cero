import { Component, AfterViewInit, ViewEncapsulation, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DbService, User } from '../service/db.service';

// Declaramos las librerías externas para que TypeScript no se queje
declare var $: any;
declare var Swiper: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.None // Importante: Permite que los estilos globales afecten a este componente
})
export class HomeComponent implements AfterViewInit {
  
  // Modelos de datos
  loginData = { email: '', password: '' };
  registerData = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'normal' as 'normal'|'admin' };
  isBrowser: boolean;

  constructor(private db: DbService, private router: Router, @Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    // Solo ejecutamos scripts visuales si estamos en el navegador
    if (this.isBrowser) {
      // setTimeout(0) mueve la ejecución al final de la pila, asegurando que el HTML ya existe
      setTimeout(() => {
        this.initMexantLogic();
      }, 0);
    }
  }

  initMexantLogic() {
    // 1. MENU HAMBURGUESA (Móvil)
    if ($('.menu-trigger').length) {
      $('.menu-trigger').off('click').on('click', function(this: any) {
        $(this).toggleClass('active');
        $('.header-area .nav').slideToggle(200);
      });
    }

    // 2. HEADER PEGAJOSO (Sticky Scroll)
    $(window).off('scroll').on('scroll', function() {
      var scroll = $(window).scrollTop();
      var box = $('.header-text').height();
      var header = $('header').height();

      if (scroll >= box - header) {
        $("header").addClass("background-header");
      } else {
        $("header").removeClass("background-header");
      }
    });

    // 3. PESTAÑAS (Tabs - Sección About Us)
    $('.tabs .menu div').off('click').on('click', function(this: any) {
      var index = $(this).index(); // 0, 1, 2...
      $('.tabs .menu div').removeClass('active');
      $(this).addClass('active');
      
      $('.naccs ul li').removeClass('active');
      $('.naccs ul li').eq(index).addClass('active');
    });

    // 4. CARRUSEL PRINCIPAL (Swiper)
    if ($('.swiper-container').length) {
      new Swiper('.swiper-container', {
        loop: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      });
    }

    // 5. CARRUSEL DE TESTIMONIOS/GALERÍA (Owl Carousel)
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

  // --- LÓGICA DE USUARIOS ---
  onLogin() {
    const user = this.db.login(this.loginData.email, this.loginData.password);
    if (user) {
      if (user.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        alert('Login exitoso (Usuario Normal)');
      }
    } else {
      alert('Credenciales incorrectas');
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
      alert('Registro exitoso. Por favor inicia sesión.');
      this.registerData = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'normal' };
    } else {
      alert('El correo ya está registrado');
    }
  }
}