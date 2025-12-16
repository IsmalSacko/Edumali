import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { inject } from '@angular/core/primitives/di';
import { environment } from '../../../environments/environment';
import { ActionLog, Alert, SchoolProfile } from 'src/app/models/altert/alert';


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
  evaluationsByTrimester?: Record<string, number>;
}

export interface EmploisDuTempsStats {
  classe: string;
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
    },
    evaluationsByTrimester: d.evaluations_by_trimester ?? undefined,
  };

}

function mapAlert(d: any): Alert {
  return {
    id: d.id,
    name: d.name ?? '',
    description: d.description ?? '',
    active: Boolean(d.active),
    created_at: d.created_at,
    is_read: Boolean(d.is_read),
    read_at: d.read_at ?? null,
    is_global: Boolean(d.is_global),
  };
}

function mapSchoolProfile(d: any): SchoolProfile {
  if (!d) return { name: '', directeur: '' } as SchoolProfile;

  // Construire l'URL complète du logo si elle est relative
  let logoUrl = d.logo ?? undefined;
  if (logoUrl && !logoUrl.startsWith('http')) {
    logoUrl = `${environment.apiUrl}${logoUrl}`;
  }

  // Récupérer le nom du directeur depuis directeur_name retourné par l'API
  const directeurName = d.directeur_name || '';

  return {
    id: d.id,
    name: d.name ?? '',
    logo: logoUrl,
    cachet: d.cachet ?? undefined,
    directeur: directeurName,
    signature_directeur: d.signature_directeur ?? undefined,
  };
}

function mapActionLog(d: any): ActionLog {
  return {
    id: d.id,
    user: d.user ?? null,
    user_info: d.user_info ?? null,
    action: d.action ?? d.name ?? '',  // Accepte 'action' OU 'name' (pour les alerts)
    timestamp: d.timestamp ?? d.created_at ?? '',  // Accepte 'timestamp' OU 'created_at'
    description: d.description ?? '',
  };
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private api = inject(ApiService);
  private readonly base = environment.apiUrl;
  private readonly statsUrl = `${this.base}/dashboard/stats/`;
  private readonly alertsUrl = `${this.base}/dashboard/alerts/`;
  // Méthode pour obtenir les statistiques du tableau de bord
  async getStats(): Promise<DashboardStats> {
    const r = await this.api.get<DashboardStats>(this.statsUrl);
    return mapStats(r.data);
  }
  // Méthode pour obtenir les alertes du tableau de bord
  async getAlerts(): Promise<Alert[]> {
    const response = await this.api.get<Alert[]>(this.alertsUrl);
    return (response.data ?? []).map(mapAlert);
  }
  // Méthode pour obtenir le profil de l'école
  async getSchoolProfile(): Promise<SchoolProfile> {
    const response = await this.api.get<any>(`${this.base}/dashboard/school-profiles/`);
    // L'API retourne un tableau, prendre le premier élément
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    return mapSchoolProfile(data);
  }
  // Méthode pour obtenir les journaux d'actions récentes
  async getActionLogs(limit: number = 10): Promise<ActionLog[]> {
    const response = await this.api.get<any[]>(`${this.base}/dashboard/action-logs/?limit=${limit}`);
    return (response.data ?? []).map(mapActionLog);
  }

  // Méthode pour obtenir les alertes personnalisées de l'utilisateur
  async getMyAlerts(): Promise<Alert[]> {
    try {
      const response = await this.api.get<Alert[]>(`${this.alertsUrl}me/`);
      return (response.data ?? []).map(mapAlert);
    } catch (err) {
      console.error('Error fetching user alerts:', err);
      return [];
    }
  }

  // Méthode pour marquer une alerte comme lue
  async markAlertAsRead(alertId: number): Promise<boolean> {
    try {
      await this.api.post(`${this.alertsUrl}${alertId}/read/`, {});
      return true;
    } catch (err) {
      console.error(`Error marking alert ${alertId} as read:`, err);
      return false;
    }
  }
}
