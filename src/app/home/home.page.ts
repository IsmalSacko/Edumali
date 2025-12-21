// ...existing code...
import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
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
import { DashboardService } from '../services/dashboard/dashboard.service';
import { ActionLog, Alert, SchoolProfile } from '../models/altert/alert';
import { AuthService } from '../services/auth/auth.service';
import { DashboardStats } from '../models/dashboard/dashboard';

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

  // Affiche le nom brut de l'alerte (pas de code en dur)
  alertLabel(name: string): string {
    return name;
  }

  // Affiche l'action brute du log (pas de code en dur)
  actionLabel(action: string): string {
    return action;
  }

  private dashboardService = inject(DashboardService);
  private auth = inject(AuthService);
  isAdmin = signal<boolean>(false);
  stats = signal<DashboardStats | null>(null);
  globalAlerts = signal<Alert[]>([]);
  personalAlerts = signal<Alert[]>([]);
  unreadCount = signal<number>(0);
  markingAll = signal<boolean>(false);
  showAllAlerts = signal<boolean>(false);
  showAllActionLogs = signal<boolean>(false);
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
    //this.isAdmin.set(this.currentUser()?.role?.toString().toLowerCase() === 'admin');
    // Ici on utilise une méthode asynchrone pour gérer les rôles qui pourraient nécessiter un appel API
    this.getUserRole();

  }



  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/school_avatar/default.png';
  }

  getLogoUrl(): string {
    const logo = this.schoolProfile()?.logo;
    return logo && logo.trim() ? logo : 'assets/school_avatar/default.png';
  }




  toggleAlerts(): void {
    this.showAllAlerts.set(!this.showAllAlerts());
  }

  toggleActionLogs(): void {
    this.showAllActionLogs.set(!this.showAllActionLogs());
  }


  // Pour l'affichage :
  // - Si admin : 3 dernières alertes (globales + persos, triées par date)
  // - Sinon : uniquement alertes persos + globales (max 2-3, bouton voir tout)
  get visibleAlerts(): Alert[] {
    if (!this.currentUser()) {
      // Non authentifié : ne voit que les alertes globales (vérifier is_global)
      const globals = this.globalAlerts().filter(a => a.is_global);
      return this.showAllAlerts() ? globals : globals.slice(0, 3);
    }
    if (this.isAdmin()) {
      // Admin : tout voir (globales + persos)
      const all = [...this.globalAlerts(), ...this.personalAlerts()];
      const sorted = all.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
      return this.showAllAlerts() ? sorted : sorted.slice(0, 2);
    } else {
      // Utilisateur connecté : seulement ses alertes persos + globales
      const persos = [...this.personalAlerts()];
      const globals = this.globalAlerts().filter(a => a.is_global);
      const all = [...persos, ...globals].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
      return this.showAllAlerts() ? all : all.slice(0, 2);
    }
  }




  // Méthode pour vérifier et définir le rôle d'administrateur
  async getUserRole() {
    const adminRole = await this.auth.isAdmin();
    this.isAdmin.set(adminRole);
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
      // Mettre à jour la liste locale (perso ou globale)
      let updatedPerso = this.personalAlerts().map(a =>
        a.id === alertId ? { ...a, is_read: true, read_at: new Date().toISOString() } : a
      );
      this.personalAlerts.set(updatedPerso);
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
        const updated = this.personalAlerts().map(a =>
          !a.is_read ? { ...a, is_read: true, read_at: new Date().toISOString() } : a
        );
        this.personalAlerts.set(updated);
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
      const [stats, globalAlerts, personalAlerts, profile, logs] = await Promise.all([
        this.dashboardService.getStats(),
        this.dashboardService.getAlerts(),
        this.dashboardService.getMyAlerts(),
        this.dashboardService.getSchoolProfile(),
        this.dashboardService.getActionLogs(5),
      ]);
      this.stats.set(stats);
      this.globalAlerts.set(globalAlerts ?? []);
      this.personalAlerts.set(personalAlerts ?? []);
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
      const [stats, globalAlerts, personalAlerts, profile, logs] = await Promise.all([
        this.dashboardService.getStats(),
        this.dashboardService.getAlerts(),
        this.dashboardService.getMyAlerts(),
        this.dashboardService.getSchoolProfile(),
        this.dashboardService.getActionLogs(5),
      ]);
      this.stats.set(stats);
      this.globalAlerts.set(globalAlerts ?? []);
      this.personalAlerts.set(personalAlerts ?? []);
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


  // Les getters sont maintenant des signaux, plus besoin de filtrer

  // Filtrer les ActionLogs personnels (qui concernent l'utilisateur)
  personalActionLogs(): ActionLog[] {
    const userId = this.currentUser()?.id;
    if (!userId) return [];
    const all = (this.actionLogs() ?? []).filter(log => log.user === userId || log.user_info?.id === userId);
    return this.showAllActionLogs() ? all : all.slice(0, 2);
  }

  cycleValue(count: number): number {
    const total = this.stats()?.totalStudents ?? 0;
    if (!total) return 0;
    const ratio = count / total;
    return Math.min(Math.max(ratio, 0), 1);
  }
}
