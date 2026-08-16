import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Matiere } from '../../models/classe/classes';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MatiereService {
  private api = inject(ApiService);
  private readonly base = environment.apiUrl + '/classes/matieres/';

  async getMatieres(): Promise<Matiere[]> {
    const r = await this.api.get<any>(this.base);
    return r.data?.results ?? r.data ?? [];
  }
}
