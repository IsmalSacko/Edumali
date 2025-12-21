import { inject, Injectable } from '@angular/core';
import { EmploiDuTemps, EmploiDuTempsItem, groupEmploisByDay, sortDayItems } from 'src/app/models/emplois/emplois';
import { environment } from 'src/environments/environment';
import { ApiService } from 'src/app/services/api/api.service';

interface FilterParams {
  classe?: number | null;
  matiere?: number | null;
  enseignant?: number | null;
  jour_semaine?: number | null;
  search?: string;
  ordering?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmploisService {
  private apiService = inject(ApiService);
  private readonly emploisURL = environment.apiUrl + '/classes/emplois-du-temps';

  private readonly DAY_MAP: Record<string, number> = {
    lundi: 1,
    mardi: 2,
    mercredi: 3,
    jeudi: 4,
    vendredi: 5,
    samedi: 6,
  };

  /**
   * Normalise les items venant de l'API pour le frontend
   */
  private normalize(items: any[]): EmploiDuTemps {
    return (items || []).map((it: any) => {
      let jourNum: number | undefined = it.jour_semaine;
      let jourDisplay: string | undefined = it.jour_semaine_display;

      // Convertit si l'API renvoie une chaîne (ex: 'lundi')
      if (typeof it.jour_semaine === 'string') {
        const key = (it.jour_semaine as string).toLowerCase();
        jourNum = this.DAY_MAP[key];
      }

      // Ajoute le label si manquant
      if (!jourDisplay && typeof jourNum === 'number') {
        const labels: Record<number, string> = { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi' };
        jourDisplay = labels[jourNum] ?? '';
      }

      return {
        ...it,
        jour_semaine: jourNum,
        jour_semaine_display: jourDisplay,
        // Assure que les heures sont au format HH:MM:SS
        heure_debut: typeof it.heure_debut === 'string' ? it.heure_debut : (it.heure_debut ?? ''),
        heure_fin: typeof it.heure_fin === 'string' ? it.heure_fin : (it.heure_fin ?? ''),
      } as EmploiDuTempsItem;
    });
  }

  /**
   * Construit les paramètres de requête en filtrant les valeurs nulles/vides
   */
  private buildParams(filters: FilterParams): string {
    const params = new URLSearchParams();

    if (filters.classe) params.append('classe', filters.classe.toString());
    if (filters.matiere) params.append('matiere', filters.matiere.toString());
    if (filters.enseignant) params.append('enseignant', filters.enseignant.toString());
    if (filters.jour_semaine) params.append('jour_semaine', filters.jour_semaine.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.ordering) params.append('ordering', filters.ordering);

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Récupère tout l'emploi du temps avec filtres optionnels
   * Paramètres :
   *   - classe: number - filtre par ID de classe
   *   - matiere: number - filtre par ID de matière
   *   - enseignant: number - filtre par ID d'enseignant
   *   - jour_semaine: number (1-6) - filtre par jour (1=Lundi, 6=Samedi)
   *   - search: string - recherche par nom de classe, matière ou enseignant
   *   - ordering: string - tri (ex: "heure_debut", "-heure_debut")
   */
  async getAll(filters?: Partial<FilterParams>): Promise<EmploiDuTemps> {
    const url = this.emploisURL + this.buildParams({ ordering: 'jour_semaine,heure_debut', ...(filters ?? {}) });
    const { data } = await this.apiService.get<any[]>(url);
    return this.normalize(data ?? []);
  }

  /**
   * Récupère l'emploi du temps d'une classe donnée
   */
  async getByClasse(classeId: number, filters?: Omit<FilterParams, 'classe'>): Promise<EmploiDuTemps> {
    const url = this.emploisURL + this.buildParams({
      classe: classeId,
      ordering: 'jour_semaine,heure_debut',
      ...(filters ?? {})
    });
    const { data } = await this.apiService.get<any[]>(url);
    return this.normalize(data ?? []);
  }

  /**
   * Récupère l'emploi du temps filtrée par jour spécifique
   */
  async getByDay(jour_semaine: number, filters?: Omit<FilterParams, 'jour_semaine'>): Promise<EmploiDuTemps> {
    const url = this.emploisURL + this.buildParams({
      jour_semaine,
      ordering: 'heure_debut',
      ...(filters ?? {})
    });
    const { data } = await this.apiService.get<any[]>(url);
    return this.normalize(data ?? []);
  }

  /**
   * Récupère un item précis d'emploi du temps
   */
  async getById(id: number): Promise<EmploiDuTempsItem | null> {
    const { data } = await this.apiService.get<EmploiDuTempsItem>(`${this.emploisURL}/${id}`);
    return data ?? null;
  }

  /**
   * Helpers UI: groupement par jour et tri par heure
   */
  groupByDay(items: EmploiDuTemps) {
    return groupEmploisByDay(items ?? []);
  }

  sortByStartTime(items: EmploiDuTemps) {
    return sortDayItems(items ?? []);
  }

  countEmplois(items: EmploiDuTemps): number {
    return (items || []).length;
  }
}
