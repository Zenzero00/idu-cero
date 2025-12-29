import { Injectable, signal } from '@angular/core';

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

  // Signal para actualizar colores en tiempo real
  currentColors = signal<AppColors>(this.getColors());

  constructor() {
    // 1. Crear usuario Admin por defecto si no existe
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

    // 2. Aplicar colores guardados al iniciar la app
    this.applyColorsToRoot(this.currentColors());
  }

  // --- GESTIÓN DE USUARIOS ---
  getUsers(): User[] {
    const data = localStorage.getItem(this.USER_KEY);
    return data ? JSON.parse(data) : [];
  }

  register(user: User): boolean {
    const users = this.getUsers();
    if (users.some(u => u.email === user.email)) return false; // El correo ya existe
    
    users.push(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(users));
    return true;
  }

  login(email: string, pass: string): User | null {
    const users = this.getUsers();
    const found = users.find(u => u.email === email && u.password === pass);
    if (found) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(found));
      return found;
    }
    return null;
  }

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  }

  getCurrentUser(): User | null {
    const u = localStorage.getItem(this.SESSION_KEY);
    return u ? JSON.parse(u) : null;
  }

  // --- GESTIÓN DE COLORES ---
  getColors(): AppColors {
    const data = localStorage.getItem(this.COLOR_KEY);
    return data ? JSON.parse(data) : {
      primary: '#43ba7f',   // Verde Mexant
      secondary: '#ff511a', // Naranja Mexant
      accent: '#212741',    // Azul Oscuro
      neutral: '#ffffff'    // Blanco
    };
  }

  saveColors(colors: AppColors) {
    localStorage.setItem(this.COLOR_KEY, JSON.stringify(colors));
    this.currentColors.set(colors);
    this.applyColorsToRoot(colors);
  }

  private applyColorsToRoot(c: AppColors) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', c.primary);
    root.style.setProperty('--secondary-color', c.secondary);
    root.style.setProperty('--accent-color', c.accent);
    root.style.setProperty('--neutral-color', c.neutral);
  }
}