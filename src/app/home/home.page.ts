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
  IonBadge, IonLabel, IonItem } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  schoolOutline,
  peopleCircleOutline,
  bookOutline,
  statsChartOutline, refreshOutline, reloadOutline, alertCircleOutline, documentTextOutline, notificationsOutline,
  calendarOutline, closeCircleOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { DashboardService, DashboardStats } from '../services/dashboard/dashboard.service';
import { ActionLog, Alert, SchoolProfile } from '../models/altert/alert';
import { AuthService } from '../services/auth/auth.service'; 

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonItem, IonLabel, 
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
  showAllAlerts = signal<boolean>(false);
  schoolProfile = signal<SchoolProfile | null>(null);
  actionLogs = signal<ActionLog[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  currentUser = this.auth.user;

  constructor() {
    addIcons({statsChartOutline,reloadOutline,peopleOutline,schoolOutline,peopleCircleOutline,bookOutline,refreshOutline,alertCircleOutline,documentTextOutline,notificationsOutline,calendarOutline,closeCircleOutline,checkmarkCircleOutline});
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
    const list = this.alerts() ?? [];
    const adminOnly = new Set(['ATTENDANCE', 'LOW_GRADE', 'GRADE', 'PAYMENT']);
    const isAdmin = this.isAdmin();
    const filtered = list.filter(a => {
      const name = a?.name ?? '';
      if (adminOnly.has(name) && !isAdmin) return false;
      return true;
    });
    return this.showAllAlerts() ? filtered : filtered.slice(0, 3);
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

  private categoryMeta(cat: string): { title: string; icon: string; color: 'primary'|'danger'|'success'|'medium' } {
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

  groupedAlerts(): Array<{ key: string; title: string; icon: string; color: string; items: Array<{ title: string; desc: string; date?: string }> }> {
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
    const groups: Record<string, Array<{ title: string; desc: string; date?: string }>> = {};
    for (const a of sorted) {
      const name = a.name ?? '';
      const cat = this.alertCategory(name);
      const label = this.alertLabel(name);
      const date = (a as any).created_at;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ title: label, desc: a.description ?? '', date });
    }
    const order = ['attendance','notes-negative','notes-new','events','other'];
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

  async loadStats() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const [stats, alerts, profile, logs] = await Promise.all([
        this.dashboardService.getStats(),
        this.dashboardService.getAlerts(),
        this.dashboardService.getSchoolProfile(),
        this.dashboardService.getActionLogs(5),
      ]);
      this.stats.set(stats);
      this.alerts.set(alerts ?? []);
      this.schoolProfile.set(profile ?? null);
      this.actionLogs.set(logs ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Impossible de charger le tableau de bord';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }

  cycleValue(count: number): number {
    const total = this.stats()?.totalStudents ?? 0;
    if (!total) return 0;
    const ratio = count / total;
    return Math.min(Math.max(ratio, 0), 1);
  }
}
