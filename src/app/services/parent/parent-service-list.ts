import { inject, Injectable } from '@angular/core';
import { Parent } from 'src/app/models/parent/parent';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api/api.service';

// Réservé au personnel côté back (ParentViewRealOnly.get_queryset) : un
// parent/élève reçoit une liste vide, pas une erreur.
@Injectable({
  providedIn: 'root',
})
export class ParentServiceList {
  private apiService = inject(ApiService);
  private readonly apiUrl = environment.apiUrl + '/accounts/parents/';

  async getParents(): Promise<Parent[]> {
    const r = await this.apiService.get<any>(this.apiUrl);
    const data = r.data?.results ?? r.data ?? [];
    return data as Parent[];
  }
}
