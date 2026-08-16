import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { Attendance, AttendanceBulkEntry, AttendanceRosterEntry } from '../../models/attendance/attendance';
import { ToastController } from '@ionic/angular/standalone';

export interface AttendanceFilter {
  student?: number;
  date?: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private api = inject(ApiService);
  private toast = inject(ToastController);
  private readonly base = environment.apiUrl;
  private readonly baseUrl = `${this.base}/attendance/`;

  attendances = signal<Attendance[]>([]);
  roster = signal<AttendanceRosterEntry[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  /** Historique de présence, filtrable par élève (parent/élève : lecture seule) */
  async getAll(params?: AttendanceFilter): Promise<Attendance[]> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const r = await this.api.get<any>(this.baseUrl, { params });
      const items = (r.data?.results ?? r.data ?? []) as Attendance[];
      this.attendances.set(items);
      return items;
    } catch (e: any) {
      const msg = e?.message ?? "Erreur lors du chargement des présences";
      this.error.set(msg);
      await this.showErrorToast(msg);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  /** Roster d'une classe à une date donnée : GET /attendance/roster/?classe=&date= */
  async getRoster(classeId: number, date: string): Promise<AttendanceRosterEntry[]> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const r = await this.api.get<AttendanceRosterEntry[]>(`${this.baseUrl}roster/`, {
        params: { classe: classeId, date },
      });
      const items = r.data ?? [];
      this.roster.set(items);
      return items;
    } catch (e: any) {
      const msg = e?.response?.status === 403
        ? "Vous n'avez pas accès à cette classe."
        : "Impossible de charger la liste de présence";
      this.error.set(msg);
      await this.showErrorToast(msg);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  /** Enregistrement groupé de l'appel : POST /attendance/bulk/ */
  async bulkMark(classeId: number, date: string, entries: AttendanceBulkEntry[]): Promise<boolean> {
    this.error.set(null);
    try {
      await this.api.post(`${this.baseUrl}bulk/`, { classe: classeId, date, entries });
      await this.showSuccessToast('Présence enregistrée');
      return true;
    } catch (e: any) {
      const msg = e?.response?.data?.detail ?? "Erreur lors de l'enregistrement de la présence";
      this.error.set(msg);
      await this.showErrorToast(msg);
      return false;
    }
  }

  private async showErrorToast(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 3000, position: 'bottom', color: 'danger' });
    await t.present();
  }

  private async showSuccessToast(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2000, position: 'bottom', color: 'success' });
    await t.present();
  }
}
