import { inject, Injectable } from '@angular/core';
import { Student } from '../../models/student/student';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class StudentServiceList {
  private apiService = inject(ApiService)
  private readonly apiUrl = environment.apiUrl + '/accounts/students/';

  constructor() { }

  async getStudents(): Promise<Student[]> {
    const s = await this.apiService.get<Student[]>(this.apiUrl);
    console.log(s.data);
    return s.data ? s.data : [];
  }

}
