import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { inject } from '@angular/core/primitives/di';
import { environment } from '../../../environments/environment';
import { ActionLog, Alert, SchoolProfile } from 'src/app/models/altert/alert';
import { mapActionLog, mapAlert, mapSchoolProfile, mapStats } from './utils';
import { DashboardStats } from 'src/app/models/dashboard/dashboard';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private api = inject(ApiService);
  private readonly base = environment.apiUrl;
  private readonly statsUrl = `${this.base}/dashboard/stats/`;
  private readonly globalAlertsUrl = `${this.base}/dashboard/alerts/`;
  private readonly personalAlertsUrl = `${this.base}/dashboard/alerts/me/`;
  private readonly readAlertsUrl = `${this.base}/dashboard/alerts`;
  // Méthode pour obtenir les statistiques du tableau de bord
  async getStats(): Promise<DashboardStats> {
    const r = await this.api.get<DashboardStats>(this.statsUrl);
    console.log('Dashboard stats response:', r.data);
    return mapStats(r.data);
  }

  // Allow passing query params (start/end/date filters) to backend
  async getStatsWithParams(params?: Record<string, any>): Promise<DashboardStats> {
    const cfg = params ? { params } : undefined;
    const r = await this.api.get<DashboardStats>(this.statsUrl, cfg);
    return mapStats(r.data);
  }
  // Méthode pour obtenir toutes les alertes du tableau de bord
  async getAlerts(): Promise<Alert[]> {
    const response = await this.api.get<Alert[]>(this.globalAlertsUrl);
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
      const response = await this.api.get<Alert[]>(`${this.personalAlertsUrl}`);
      return (response.data ?? []).map(mapAlert);
    } catch (err) {
      console.error('Error fetching user alerts:', err);
      return [];
    }
  }

  // Méthode pour marquer une alerte comme lue
  async markAlertAsRead(alertId: number): Promise<boolean> {
    try {
      await this.api.post(`${this.readAlertsUrl}/${alertId}/read/`, {});
      return true;
    } catch (err) {
      console.error(`Error marking alert ${alertId} as read:`, err);
      return false;
    }
  }
}
