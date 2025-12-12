import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';    
import { inject } from '@angular/core/primitives/di';
import { environment } from '../../../environments/environment';


export interface StudentsByCycle {
  primaire: number;
  secondaire: number;
  lycee: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  totalMatieres: number;
  averageGlobal: number;
  studentsByCycle: StudentsByCycle;
}

export interface EmploisDuTempsStats {
  classe : string;
}

export interface EmploiDuTempsItem {
  id: number;
  classe: {
    id: number;
    nom: string;
  };
  matiere: {
    id: number;
    nom: string;
  };
  enseignant?: {
    id: number;
    nom?: string;
    first_name?: string;
    last_name?: string;
  } | null;
  jour_semaine: number; // 1=Lundi .. 6=Samedi
  heure_debut: string; // format 'HH:MM:SS' ou 'HH:MM'
  heure_fin: string;
}

function mapStats(d: any): DashboardStats {
  return {
    totalStudents: d.total_students ?? 0,
    totalTeachers: d.total_teachers ?? 0,
    totalParents: d.total_parents ?? 0,
    totalClasses: d.total_classes ?? 0,
    totalMatieres: d.total_matieres ?? 0,
    averageGlobal: d.moyenne_generale ?? 0,
    studentsByCycle: {
      primaire: d.students_by_cycle?.primaire ?? 0,
      secondaire: d.students_by_cycle?.secondaire ?? 0,
      lycee: d.students_by_cycle?.lycee ?? 0,
    }
  };
}



@Injectable({
  providedIn: 'root',
})
export class DashboardService {
   private api = inject(ApiService);
   private readonly base = environment.apiUrl
   private readonly statsUrl = `${this.base}/dashboard/stats/`;

  async getStats(): Promise<DashboardStats> {
    const r =  await this.api.get<DashboardStats>(this.statsUrl);
    return mapStats(r.data);
  }

  

}
