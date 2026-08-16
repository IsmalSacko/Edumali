import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { Message } from '../../models/messaging/message';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class MessagingService {
  private api = inject(ApiService);
  private toast = inject(ToastController);
  private readonly base = environment.apiUrl;
  private readonly baseUrl = `${this.base}/messages/`;

  messages = signal<Message[]>([]);
  unreadCount = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  /** Boîte de réception + envoyés (le back retourne sender=self OR receiver=self) */
  async getInbox(): Promise<Message[]> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const r = await this.api.get<any>(this.baseUrl);
      const items = (r.data?.results ?? r.data ?? []) as Message[];
      this.messages.set(items);
      return items;
    } catch (e: any) {
      const msg = e?.message ?? 'Erreur lors du chargement des messages';
      this.error.set(msg);
      await this.showErrorToast(msg);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  async send(receiver: number, subject: string, content: string): Promise<boolean> {
    this.error.set(null);
    try {
      await this.api.post(this.baseUrl, { receiver, subject, content });
      await this.showSuccessToast('Message envoyé');
      return true;
    } catch (e: any) {
      const msg = e?.response?.data ? Object.values(e.response.data)[0] : "Impossible d'envoyer le message";
      const text = Array.isArray(msg) ? msg[0] : String(msg);
      this.error.set(text);
      await this.showErrorToast(text);
      return false;
    }
  }

  async markRead(id: number): Promise<boolean> {
    try {
      await this.api.post(`${this.baseUrl}${id}/mark-read/`, {});
      this.messages.set(this.messages().map(m => (m.id === id ? { ...m, read: true } : m)));
      await this.refreshUnreadCount();
      return true;
    } catch (e) {
      console.error('markRead error', e);
      return false;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.api.delete(`${this.baseUrl}${id}/`);
      this.messages.set(this.messages().filter(m => m.id !== id));
      return true;
    } catch (e) {
      console.error('delete message error', e);
      await this.showErrorToast('Impossible de supprimer ce message');
      return false;
    }
  }

  async refreshUnreadCount(): Promise<number> {
    try {
      const r = await this.api.get<{ unread_count: number }>(`${this.baseUrl}unread-count/`);
      const count = r.data?.unread_count ?? 0;
      this.unreadCount.set(count);
      return count;
    } catch (e) {
      return this.unreadCount();
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
