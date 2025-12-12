// api.service.ts
import { Injectable } from '@angular/core';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private axios: AxiosInstance;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(private auth: AuthService) {
    this.axios = axios.create({ baseURL: environment.apiUrl });

    // Add access token to headers
    this.axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = this.auth.access;
      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    });

    // Handle 401 by trying refresh once
    this.axios.interceptors.response.use(
      (resp: AxiosResponse) => resp,
      async (error: unknown) => {
        const axiosErr = error as AxiosError;
        const original = axiosErr?.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
        if (!original || axiosErr?.response?.status !== 401) return Promise.reject(error);

        if (original._retry) return Promise.reject(error);
        original._retry = true;

        try {
          const newAccess = await this.doRefresh(); // single-flight
          if (newAccess) {
            original.headers = original.headers || {};
            original.headers['Authorization'] = `Bearer ${newAccess}`;
            return this.axios(original);
          }
        } catch (e: unknown) {
          // refresh failed -> force logout
          this.auth.access = null;
          this.auth.removeRefresh();
          return Promise.reject(e);
        }

        return Promise.reject(error);
      }
    );
  }

  // Single-flight refresh // en frogais "actualisation de token"
  private async doRefresh(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) return this.refreshPromise;

    this.isRefreshing = true;
    this.refreshPromise = new Promise<string | null>(async (resolve, reject) => {
      try {
        const refresh = this.auth.getRefresh();
        if (!refresh) throw new Error('No refresh token');

        const resp = await axios.post(`${environment.apiUrl}/auth/jwt/refresh/`, { refresh });
        const data = resp.data;
        if (!data?.access) throw new Error('No access in refresh response');

        // update tokens
        this.auth.access = data.access;
        if (data.refresh) this.auth.setRefresh(data.refresh);

        this.isRefreshing = false;
        this.refreshPromise = null;
        resolve(data.access);
      } catch (err) {
        this.isRefreshing = false;
        this.refreshPromise = null;
        reject(err);
      }
    });

    return this.refreshPromise;
  }

  // wrappers
  get<T = any>(url: string, cfg?: AxiosRequestConfig) { return this.axios.get<T>(url, cfg); }
  post<T = any>(url: string, data?: any, cfg?: AxiosRequestConfig) { return this.axios.post<T>(url, data, cfg); }
  put<T = any>(url: string, data?: any, cfg?: AxiosRequestConfig) { return this.axios.put<T>(url, data, cfg); }
  patch<T = any>(url: string, data?: any, cfg?: AxiosRequestConfig) { return this.axios.patch<T>(url, data, cfg); }
  delete<T = any>(url: string, cfg?: AxiosRequestConfig) { return this.axios.delete<T>(url, cfg); }
}
