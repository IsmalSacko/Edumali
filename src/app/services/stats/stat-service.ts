import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api/api.service';
import { map, Observable } from 'rxjs';
import { DashboardStats } from 'src/app/models/dashboard/dashboard';

@Injectable({
  providedIn: 'root',
})
export class StatService {
  private api = inject(ApiService);
  private readonly base = environment.apiUrl;
  private readonly statsUrl = `${this.base}/dashboard/stats/`;
  private readonly globalAlertsUrl = `${this.base}/dashboard/alerts/`;
  private readonly personalAlertsUrl = `${this.base}/dashboard/alerts/me/`;
  private readonly readAlertsUrl = `${this.base}/dashboard/alerts`;



  async MyStats(): Promise<DashboardStats> {
    const response = await this.api.get<DashboardStats>(this.statsUrl);
    return response.data;

  }
}

