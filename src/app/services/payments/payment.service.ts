import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { Payment } from '../../models/payments/payment';
import { ToastController } from '@ionic/angular/standalone';

export interface PaymentFilter {
  student?: string; // filtre back = nom (icontains), pas un ID (apps/payments/filters.py)
  status?: string;
  type_payment?: string;
  receipt_number?: string;
}

/**
 * CRUD paiements. Réservé admin/comptable côté back (IsAdminOrComptable) —
 * aucun accès en lecture pour parent/élève actuellement, donc pas de mode
 * "lecture seule" ici tant que le back n'expose pas cette voie.
 */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private api = inject(ApiService);
  private toast = inject(ToastController);
  private readonly base = environment.apiUrl;
  private readonly baseUrl = `${this.base}/payments/`;

  payments = signal<Payment[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  async getAll(params?: PaymentFilter): Promise<Payment[]> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const r = await this.api.get<any>(this.baseUrl, { params });
      const items = (r.data?.results ?? r.data ?? []) as Payment[];
      this.payments.set(items);
      return items;
    } catch (e: any) {
      const msg = e?.response?.status === 403
        ? "Accès réservé aux comptables/administrateurs."
        : 'Erreur lors du chargement des paiements';
      this.error.set(msg);
      await this.showErrorToast(msg);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async create(payment: Partial<Payment>): Promise<Payment | null> {
    this.error.set(null);
    try {
      const r = await this.api.post<Payment>(this.baseUrl, payment);
      await this.showSuccessToast(`Paiement enregistré (${r.data.receipt_number ?? ''})`);
      return r.data;
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = data ? String(Object.values(data)[0]) : "Impossible d'enregistrer le paiement";
      this.error.set(msg);
      await this.showErrorToast(msg);
      return null;
    }
  }

  async getById(id: number): Promise<Payment | null> {
    try {
      const r = await this.api.get<Payment>(`${this.baseUrl}${id}/`);
      return r.data;
    } catch (e) {
      console.error('getById payment error', e);
      return null;
    }
  }

  private async showErrorToast(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 3000, position: 'bottom', color: 'danger' });
    await t.present();
  }

  private async showSuccessToast(message: string): Promise<void> {
    const t = await this.toast.create({ message, duration: 2500, position: 'bottom', color: 'success' });
    await t.present();
  }
}
