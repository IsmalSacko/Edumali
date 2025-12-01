// auth.service.ts
import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment'; 

@Injectable({ providedIn: 'root' })
export class AuthService {
  // access token en mémoire/sessionStorage
  private _access: string | null = null;
  private readonly base = environment.apiUrl;
  private readonly loginUrl = `${this.base}/auth/jwt/create/`;

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

  async currentUser() {
    const url = `${this.base}/users/me/`;
    const r = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${this.access}`
      }
    });
    return r.data;
  }
}
