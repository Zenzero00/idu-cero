import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'normal';
}

export interface AppColors {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
}

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private USER_KEY = 'app_users';
  private COLOR_KEY = 'app_colors';
  private SESSION_KEY = 'app_current_user';
  private isBrowser: boolean;

  // Signal inicializada con valores por defecto para evitar errores en SSR
  currentColors = signal<AppColors>({
    primary: '#43ba7f',
    secondary: '#ff511a',
    accent: '#212741',
    neutral: '#ffffff'
  });

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      // Solo ejecutamos lógica de LocalStorage si estamos en el navegador
      this.initAdmin();
      const savedColors = this.getColors();
      this.currentColors.set(savedColors);
      this.applyColorsToRoot(savedColors);
    }
  }

  private initAdmin() {
    if (!this.isBrowser) return;
    const users = this.getUsers();
    if (!users.some(u => u.role === 'admin')) {
      this.register({
        firstName: 'Admin',
        lastName: 'Principal',
        email: 'admin@test.com',
        password: '123',
        role: 'admin'
      });
      console.log('Usuario Admin creado: admin@test.com / 123');
    }
  }

  // --- GESTIÓN DE USUARIOS ---
  getUsers(): User[] {
    if (!this.isBrowser) return [];
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : [];
  }

  register(user: User): boolean {
    if (!this.isBrowser) return false;
    const users = this.getUsers();
    if (users.some(u => u.email === user.email)) return false; 
    
    users.push(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(users));
    return true;
  }

  login(email: string, pass: string): User | null {
    if (!this.isBrowser) return null;
    const users = this.getUsers();
    const found = users.find(u => u.email === email && u.password === pass);
    if (found) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(found));
      return found;
    }
    return null;
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  getCurrentUser(): User | null {
    if (!this.isBrowser) return null;
    const u = localStorage.getItem(this.SESSION_KEY);
    return u ? JSON.parse(u) : null;
  }

  // --- GESTIÓN DE COLORES ---
  getColors(): AppColors {
    if (!this.isBrowser) {
      return { primary: '#43ba7f', secondary: '#ff511a', accent: '#212741', neutral: '#ffffff' };
    }
    const data = localStorage.getItem(this.COLOR_KEY);
    return data ? JSON.parse(data) : {
      primary: '#43ba7f',
      secondary: '#ff511a',
      accent: '#212741',
      neutral: '#ffffff'
    };
  }

  saveColors(colors: AppColors) {
    if (this.isBrowser) {
      localStorage.setItem(this.COLOR_KEY, JSON.stringify(colors));
      this.currentColors.set(colors);
      this.applyColorsToRoot(colors);
    }
  }

  private applyColorsToRoot(c: AppColors) {
    if (!this.isBrowser) return;
    const root = document.documentElement;
    root.style.setProperty('--primary-color', c.primary);
    root.style.setProperty('--secondary-color', c.secondary);
    root.style.setProperty('--accent-color', c.accent);
    root.style.setProperty('--neutral-color', c.neutral);
  }
}