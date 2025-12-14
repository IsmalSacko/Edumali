// auth.service.ts
import { inject, Injectable, signal, effect } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment'; 
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // access token en mémoire/sessionStorage
  private _access: string | null = null;
  private readonly base = environment.apiUrl;
  private readonly loginUrl = `${this.base}/auth/jwt/create/`;
  private route = inject(Router);

  // Signal global pour l'utilisateur courant - accessible par tous les composants
  public user = signal<any | null>(null);
  private _initialized = false;

  constructor() {
    // restore access if page reloaded
    this._access = sessionStorage.getItem('access_token');
    
    // Charger l'utilisateur au démarrage si connecté
    if (this._access && !this._initialized) {
      this._initialized = true;
      this.loadCurrentUser().catch(err => {
        console.error('Failed to load user on startup:', err);
        this._access = null;
        this.user.set(null);
      });
    }
  }

  set access(token: string | null) {
    this._access = token;
    if (token) sessionStorage.setItem('access_token', token);
    else sessionStorage.removeItem('access_token');
  }

  get access(): string | null {
    return this._access;
  }

  // refresh token en localStorage (simple)
  private refreshKey = 'refresh_token';
  setRefresh(token: string) { 
    localStorage.setItem(this.refreshKey, token); 
  }
  getRefresh(): string | null {
     return localStorage.getItem(this.refreshKey);
     }
  removeRefresh() { localStorage.removeItem(this.refreshKey); }

  // Charger l'utilisateur courant et mettre à jour le signal
  private async loadCurrentUser() {
    try {
      const userData = await this.currentUser();
      this.user.set(userData);
    } catch (err) {
      console.error('Failed to load current user:', err);
      this.user.set(null);
    }
  }

  // login: returns response data
  async login(username: string, password: string) {
    const response = await axios.post(this.loginUrl, { username, password });
    const data = response.data;
    if (data?.access) this.access = data.access;
    if (data?.refresh) this.setRefresh(data.refresh);
    console.log('Logged in, access token set.' + (this.access ? '✅'+this.access : '❌'));
    // Charger les infos utilisateur et mettre à jour le signal global
    await this.loadCurrentUser();
    return data;
  }


  logout() {
    this.access = null;
    localStorage.removeItem(this.refreshKey);
    // Réinitialiser l'utilisateur global
    this.user.set(null);
  }

  async currentUserRole() {
    const url = `${this.base}/users/me/`;
    const r = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${this.access}`
        
      }
    });
    const role = r.data.role;
    if (role !== 'admin') {
      this.route.navigate(['/dashboard']);
    }
    console.log('Current User Role:', role);
    // redirect au dashboard if no role
   
    return r.data.role ? r.data : null;
  }
  

   async currentUser() {
    const url = `${this.base}/users/me/`;
    const r = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${this.access}`
        
      }
    });
    
    return r.data;
  }
  
    // Retourne le rôle, ou null
    async getUserRole(): Promise<string | null> {
      try {
        const user = await this.currentUser();
        return user?.role ?? null;
      } catch (err) {
        console.warn('getUserRole error', err);
        return null;
      }
    }

    // Indique si l'utilisateur est admin
    async isAdmin(): Promise<boolean> {
      const role = await this.getUserRole();
      return role === 'admin' || role === 'ADMIN' || role === 'Admin';
    }
  

}
