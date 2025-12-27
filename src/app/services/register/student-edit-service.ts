import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api/api.service';

export interface Student {
  id: number;
  date_of_birth: string;
  gender: 'M' | 'F';
  status: string;
  classe?: number | null;
  matricule?: string;
  user_detail?: {
    first_name: string;
    last_name: string;
    email: string;
    evaluations?: any[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class StudentEditService {
  private api = inject(ApiService);
  private readonly base = environment.apiUrl + '/accounts/student-register';

  async getStudents(): Promise<Student[]> {
    const response = await this.api.get<Student[]>(this.base);
    console.log('✅ Students fetched:', response.data);
    return response.data;
  }

  async getStudent(id: number): Promise<Student> {
    const response = await this.api.get<Student>(`${this.base}/${id}/`);
    return response.data;
  }

  patchStudent(id: number, student: Partial<Student>) {
    return this.api.patch<Student>(`${this.base}/${id}/`, student);
  }
}
