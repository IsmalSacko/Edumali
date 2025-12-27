import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api/api.service';
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  passwordConfirm?: string;
  role: Role;
}

export type Role = 'teacher' | 'parent' | 'student' | 'surveillant' | 'comptable';

export const ROLE_CHOICES: { value: Role; label: string }[] = [
  //{ value: 'admin', label: 'Administrateur' },
  { value: 'teacher', label: 'Enseignant' },
  { value: 'parent', label: 'Parent' },
  { value: 'student', label: 'Élève' },
  { value: 'surveillant', label: 'Surveillant' },
  { value: 'comptable', label: 'Comptable' },
];
@Injectable({
  providedIn: 'root',
})

export class RegisterService {
  private readonly base = environment.apiUrl + '/auth/users/';
  private apiService = inject(ApiService);

  async register(data: RegisterData): Promise<RegisterData[]> {
    try {
      const response = await this.apiService.post<RegisterData[]>(this.base, data);
      console.log('✅ Inscription réussie:', response.data);
      return response?.data || [];
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      throw error;
    }
  }


}
