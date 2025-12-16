import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonProgressBar,
  IonSkeletonText,
  IonButton,
  IonBadge, IonLabel, IonItem, IonRefresher, IonRefresherContent, IonSpinner, IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  schoolOutline,
  peopleCircleOutline,
  bookOutline,
  statsChartOutline, refreshOutline, reloadOutline, alertCircleOutline, documentTextOutline, notificationsOutline,
  calendarOutline, closeCircleOutline, checkmarkCircleOutline, megaphoneOutline
} from 'ionicons/icons';
import { DashboardService, DashboardStats } from '../services/dashboard/dashboard.service';
import { ActionLog, Alert, SchoolProfile } from '../models/altert/alert';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonToast, IonSpinner, IonRefresherContent, IonRefresher, IonItem, IonLabel,
    IonHeader,
    IonToolbar,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonProgressBar,
    IonSkeletonText,
    IonButton,
    IonBadge,
    DatePipe,
    DecimalPipe,
  ],
})
export class HomePage {
  private dashboardService = inject(DashboardService);
  private auth = inject(AuthService);

  stats = signal<DashboardStats | null>(null);
  alerts = signal<Alert[]>([]);
  unreadCount = signal<number>(0);
  markingAll = signal<boolean>(false);
  showAllAlerts = signal<boolean>(false);
  schoolProfile = signal<SchoolProfile | null>(null);
  actionLogs = signal<ActionLog[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  currentUser = this.auth.user;
  markingAlertId = signal<number | null>(null);
  toastMessage = signal<string | null>(null);
  toastColor = signal<'success' | 'danger' | 'warning'>('success');

  constructor() {
    addIcons({ statsChartOutline, reloadOutline, peopleOutline, schoolOutline, peopleCircleOutline, bookOutline, refreshOutline, alertCircleOutline, documentTextOutline, notificationsOutline, calendarOutline, closeCircleOutline, checkmarkCircleOutline, megaphoneOutline });
    this.loadStats();
  }

  private readonly ACTION_LABELS: Record<string, string> = {
    ATTENDANCE: 'Absences reportées',
    LOW_GRADE: 'Mauvaises notes',
    GRADE: 'Nouvelle note ajoutée',
    SCHOOL_EVENT: 'Nouvel événement scolaire',
    EXAM_SCHEDULE: 'Calendrier des examens publié',
    GREVE: 'Annonce de grève',
    TEACHER_MISSING: "Absence d'enseignant",
    PAYMENT: 'Paiement effectué',
    GENERAL: 'Alerte générale',
  };

  actionLabel(code: string | null | undefined): string {
    if (!code) return '';
    return this.ACTION_LABELS[code] ?? code;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/school_avatar/default.png';
  }

  getLogoUrl(): string {
    const logo = this.schoolProfile()?.logo;
    return logo && logo.trim() ? logo : 'assets/school_avatar/default.png';
  }



  private readonly ALERT_LABELS: Record<string, string> = {
    ATTENDANCE: 'Absences reportées',
    LOW_GRADE: 'Mauvaises notes',
    GRADE: 'Nouvelle note ajoutée',
    SCHOOL_EVENT: 'Nouvel événement scolaire',
    EXAM_SCHEDULE: 'Calendrier des examens publié',
    GREVE: 'Annonce de grève',
    TEACHER_MISSING: "Absence d'enseignant",
    PAYMENT: 'Paiement effectué',
    GENERAL: 'Alerte générale',
  };

  alertLabel(name: string | null | undefined): string {
    if (!name) return '';
    return this.ALERT_LABELS[name] ?? name;
  }

  toggleAlerts(): void {
    this.showAllAlerts.set(!this.showAllAlerts());
  }

  visibleAlerts(): Alert[] {
    const list = this.personalAlerts(); // Uniquement les alertes personnelles
    // Trier: alertes non-lues d'abord, puis par date décroissante
    const sorted = [...list].sort((a, b) => {
      if ((a.is_read ?? false) !== (b.is_read ?? false)) {
        return (a.is_read ?? false) ? 1 : -1; // non-lues en premier
      }
      const da = (a.created_at ?? '') as string;
      const db = (b.created_at ?? '') as string;
      return db.localeCompare(da);
    });
    return this.showAllAlerts() ? sorted : sorted.slice(0, 3);
  }

  // Section rendering helpers
  private alertCategory(name: string): 'events' | 'notes-negative' | 'notes-new' | 'attendance' | 'other' {
    switch (name) {
      case 'SCHOOL_EVENT': return 'events';
      case 'LOW_GRADE': return 'notes-negative';
      case 'GRADE': return 'notes-new';
      case 'ATTENDANCE': return 'attendance';
      default: return 'other';
    }
  }

  private categoryMeta(cat: string): { title: string; icon: string; color: 'primary' | 'danger' | 'success' | 'medium' } {
    switch (cat) {
      case 'events': return { title: 'Événements scolaires', icon: 'calendar-outline', color: 'primary' };
      case 'notes-negative': return { title: 'Notes (négatives)', icon: 'close-circle-outline', color: 'danger' };
      case 'notes-new': return { title: 'Nouvelles notes', icon: 'checkmark-circle-outline', color: 'success' };
      case 'attendance': return { title: 'Présence / Absences', icon: 'alert-circle-outline', color: 'danger' };
      default: return { title: 'Autres alertes', icon: 'notifications-outline', color: 'medium' };
    }
  }

  private priority(name: string): number {
    // Lower number = higher priority
    switch (name) {
      case 'LOW_GRADE': return 1;
      case 'ATTENDANCE': return 1;
      case 'GRADE': return 2;
      case 'SCHOOL_EVENT': return 3;
      default: return 4;
    }
  }

  groupedAlerts(): Array<{ key: string; title: string; icon: string; color: string; items: Array<{ id?: number; title: string; desc: string; date?: string; is_read?: boolean; is_global?: boolean }> }> {
    const items = this.visibleAlerts();
    // Sort by priority (critical first) and then newest by created_at if available
    const sorted = [...items].sort((a, b) => {
      const pa = this.priority(a.name ?? '');
      const pb = this.priority(b.name ?? '');
      if (pa !== pb) return pa - pb;
      const da = (a as any).created_at ?? '';
      const db = (b as any).created_at ?? '';
      return (db || '').localeCompare(da || '');
    });
    const groups: Record<string, Array<{ id?: number; title: string; desc: string; date?: string; is_read?: boolean; is_global?: boolean }>> = {};
    for (const a of sorted) {
      const name = a.name ?? '';
      const cat = this.alertCategory(name);
      const label = this.alertLabel(name);
      const date = (a as any).created_at;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ id: a.id, title: label, desc: a.description ?? '', date, is_read: a.is_read, is_global: a.is_global });
    }
    const order = ['attendance', 'notes-negative', 'notes-new', 'events', 'other'];
    return order
      .filter(k => groups[k]?.length)
      .map(k => {
        const meta = this.categoryMeta(k);
        return { key: k, title: meta.title, icon: meta.icon, color: meta.color, items: groups[k]! };
      });
  }

  private isAdmin(): boolean {
    const role = this.currentUser()?.role;
    if (!role) return false;
    const r = String(role).toLowerCase();
    return r === 'admin';
  }

  // Mettre à jour le compteur d'alertes non-lues (uniquement personnelles)
  private updateUnreadCount(): void {
    const unread = this.personalAlerts().filter(a => !a.is_read).length;
    this.unreadCount.set(unread);
  }

  // Marquer une alerte comme lue
  async markAsRead(alertId: number | undefined): Promise<void> {
    if (!alertId) return;

    this.markingAlertId.set(alertId);
    const success = await this.dashboardService.markAlertAsRead(alertId);
    this.markingAlertId.set(null);

    if (success) {
      // Mettre à jour la liste locale
      const updated = this.alerts().map(a =>
        a.id === alertId ? { ...a, is_read: true, read_at: new Date().toISOString() } : a
      );
      this.alerts.set(updated);
      this.updateUnreadCount();
      this.showToast('Alerte marquée comme lue', 'success');
    } else {
      this.showToast('Erreur lors du marquage de l\'alerte', 'danger');
    }
  }

  // Marquer toutes les alertes personnelles non lues comme lues
  async markAllUnread(): Promise<void> {
    const unread = this.personalAlerts().filter(a => !a.is_read && a.id);
    if (!unread.length || this.markingAll()) return;

    this.markingAll.set(true);
    try {
      const results = await Promise.all(unread.map(a => this.dashboardService.markAlertAsRead(a.id!)));
      const successCount = results.filter(Boolean).length;
      if (successCount) {
        const updated = this.alerts().map(a =>
          !a.is_global && !a.is_read ? { ...a, is_read: true, read_at: new Date().toISOString() } : a
        );
        this.alerts.set(updated);
        this.updateUnreadCount();
        this.showToast('Alertes marquées comme lues', 'success');
      } else {
        this.showToast('Aucune alerte marquée', 'warning');
      }
    } catch (err) {
      this.showToast('Erreur lors du marquage', 'danger');
    } finally {
      this.markingAll.set(false);
    }
  }

  // Afficher un toast
  private showToast(message: string, color: 'success' | 'danger' | 'warning'): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    setTimeout(() => this.toastMessage.set(null), 2500);
  }

  // Pull to refresh
  async onRefresh(event: any): Promise<void> {
    try {
      const [stats, alerts, profile, logs] = await Promise.all([
        this.dashboardService.getStats(),
        this.dashboardService.getMyAlerts(),
        this.dashboardService.getSchoolProfile(),
        this.dashboardService.getActionLogs(5),
      ]);
      this.stats.set(stats);
      this.alerts.set(alerts ?? []);
      this.schoolProfile.set(profile ?? null);
      this.actionLogs.set(logs ?? []);
      this.updateUnreadCount();
      this.showToast('Données actualisées', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du rafraîchissement';
      this.showToast(message, 'danger');
    } finally {
      event.detail.complete();
    }
  }

  async loadStats() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [stats, alerts, profile, logs] = await Promise.all([
        this.dashboardService.getStats(),
        this.dashboardService.getMyAlerts(),
        this.dashboardService.getSchoolProfile(),
        this.dashboardService.getActionLogs(5),
      ]);
      this.stats.set(stats);
      this.alerts.set(alerts ?? []);
      this.schoolProfile.set(profile ?? null);
      this.actionLogs.set(logs ?? []);
      this.updateUnreadCount();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Impossible de charger le tableau de bord';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  // Filtrer uniquement les alertes personnelles (non globales)
  personalAlerts(): Alert[] {
    return (this.alerts() ?? []).filter(a => !a.is_global);
  }

  // Filtrer uniquement les alertes globales
  globalAlerts(): Alert[] {
    return (this.alerts() ?? []).filter(a => a.is_global);
  }

  // Filtrer les ActionLogs personnels (qui concernent l'utilisateur)
  personalActionLogs(): ActionLog[] {
    const userId = this.currentUser()?.id;
    if (!userId) return [];
    return (this.actionLogs() ?? []).filter(log => log.user === userId || log.user_info?.id === userId);
  }

  cycleValue(count: number): number {
    const total = this.stats()?.totalStudents ?? 0;
    if (!total) return 0;
    const ratio = count / total;
    return Math.min(Math.max(ratio, 0), 1);
  }
}
