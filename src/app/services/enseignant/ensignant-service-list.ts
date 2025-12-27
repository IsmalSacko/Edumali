import { inject, Injectable } from '@angular/core';
import { Enseignant } from 'src/app/models/enseignant/enseignant';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class EnseignantServiceList {
  private apiService = inject(ApiService)
  private readonly apiUrl = environment.apiUrl + '/accounts/teachers/';

  constructor() { }

  async getTeachers(): Promise<Enseignant[]> {
    const e = await this.apiService.get<Enseignant[]>(this.apiUrl);
    console.log('enseignants fetched:', e);
    return e.data ? e.data : [];
  }

  async getTeacher(id: number): Promise<Enseignant | null> {
    const e = await this.apiService.get<Enseignant>(this.apiUrl + id + '/');
    console.log('enseignant fetched:', e);
    return e.data ? e.data : null;
  }

}
