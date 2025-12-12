// auth.service.ts
import { inject, Injectable } from '@angular/core';
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

  constructor() {
    // restore access if page reloaded
    this._access = sessionStorage.getItem('access_token');
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

  // login: returns response data
  async login(username: string, password: string) {
    const response = await axios.post(this.loginUrl, { username, password });
    const data = response.data;
    if (data?.access) this.access = data.access;
    if (data?.refresh) this.setRefresh(data.refresh);
    console.log('Logged in, access token set.' + (this.access ? '✅'+this.access : '❌'));
    return data;
  }


  logout() {
    this.access = null;
    localStorage.removeItem(this.refreshKey);
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
