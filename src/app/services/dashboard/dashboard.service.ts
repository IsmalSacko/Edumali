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
  // Méthode pour obtenir le profil de l'école. Ne doit jamais rejeter : cet
  // appel fait partie d'un Promise.all avec les stats/alertes (voir
  // home.page.ts::loadStats) — le laisser rejeter faisait échouer tout le
  // chargement du dashboard (stats comprises) pour un seul appel en échec.
  async getSchoolProfile(): Promise<SchoolProfile> {
    try {
      const response = await this.api.get<any>(`${this.base}/dashboard/school-profiles/`);
      // L'API retourne un tableau, prendre le premier élément
      const data = Array.isArray(response.data) ? response.data[0] : response.data;
      return mapSchoolProfile(data);
    } catch (err) {
      console.error('Error fetching school profile:', err);
      return mapSchoolProfile(undefined);
    }
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

  // Crée (si aucun profil n'existe encore, id undefined) ou met à jour le
  // profil d'établissement. multipart/form-data car logo/cachet/signature
  // sont des ImageField côté back (apps/dashboard/models.py::SchoolProfile).
  async saveSchoolProfile(
    id: number | undefined,
    data: { name?: string; logo?: File; cachet?: File; signature_directeur?: File }
  ): Promise<SchoolProfile | null> {
    const form = new FormData();
    if (data.name !== undefined) form.append('name', data.name);
    if (data.logo) form.append('logo', data.logo);
    if (data.cachet) form.append('cachet', data.cachet);
    if (data.signature_directeur) form.append('signature_directeur', data.signature_directeur);

    try {
      const url = id ? `${this.base}/dashboard/school-profiles/${id}/` : `${this.base}/dashboard/school-profiles/`;
      const response = id ? await this.api.patch<any>(url, form) : await this.api.post<any>(url, form);
      return mapSchoolProfile(response.data);
    } catch (err) {
      console.error('Error saving school profile:', err);
      return null;
    }
  }
}
