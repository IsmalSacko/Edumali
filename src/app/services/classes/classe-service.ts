import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Classe, ClasseListe } from '../../models/classe/classes';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClasseService {
  private readonly base = environment.apiUrl  + '/classes/classes/';

  constructor(private api: ApiService) {}

  async getClasses(): Promise<ClasseListe[]> {
    const { data } = await this.api.get<ClasseListe[]>(this.base);
    //console.log('Fetched classes:', data);
    return data;
  }

  async getClasseDetail(id: number): Promise<Classe> {
    const { data } = await this.api.get<Classe>(`${this.base}${id}`);
    console.log(`Fetched classe detail for ID ${id}:`, data);
    return data;
  }
}
