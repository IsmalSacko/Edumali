import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline, checkmarkDoneOutline, megaphoneOutline, personOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { Alert } from '../../models/altert/alert';

type Filter = 'all' | 'unread';

@Component({
  selector: 'app-notifications',
  standalone: true,
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  imports: [
    CommonModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonSegment,
    IonSegmentButton,
  ],
})
export class NotificationsPage implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = signal<boolean>(true);
  filter = signal<Filter>('all');
  globalAlerts = signal<Alert[]>([]);
  personalAlerts = signal<Alert[]>([]);
  markingAll = signal<boolean>(false);
  markingId = signal<number | null>(null);

  allAlerts = computed(() => {
    const all = [...this.personalAlerts(), ...this.globalAlerts()];
    return all.sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
  });

  visibleAlerts = computed(() => {
    if (this.filter() === 'unread') {
      return this.allAlerts().filter(a => !a.is_read);
    }
    return this.allAlerts();
  });

  unreadCount = computed(() => this.personalAlerts().filter(a => !a.is_read).length);

  readonly pageSize = 20;
  currentPage = signal<number>(1);

  totalPages = computed(() => Math.max(1, Math.ceil(this.visibleAlerts().length / this.pageSize)));

  pagedAlerts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.visibleAlerts().slice(start, start + this.pageSize);
  });

  constructor() {
    addIcons({ notificationsOutline, checkmarkDoneOutline, megaphoneOutline, personOutline, chevronBackOutline, chevronForwardOutline });
  }

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    const [globalAlerts, personalAlerts] = await Promise.all([
      this.dashboardService.getAlerts(),
      this.dashboardService.getMyAlerts(),
    ]);
    this.globalAlerts.set(globalAlerts ?? []);
    this.personalAlerts.set(personalAlerts ?? []);
    this.loading.set(false);
  }

  setFilter(value: Filter) {
    this.filter.set(value);
    this.currentPage.set(1);
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  async markAsRead(alert: Alert) {
    if (!alert.id || alert.is_read) return;
    this.markingId.set(alert.id);
    const ok = await this.dashboardService.markAlertAsRead(alert.id);
    this.markingId.set(null);
    if (ok) {
      this.personalAlerts.set(
        this.personalAlerts().map(a => (a.id === alert.id ? { ...a, is_read: true, read_at: new Date().toISOString() } : a))
      );
    }
  }

  async markAllRead() {
    const unread = this.personalAlerts().filter(a => !a.is_read && a.id);
    if (!unread.length || this.markingAll()) return;
    this.markingAll.set(true);
    await Promise.all(unread.map(a => this.dashboardService.markAlertAsRead(a.id!)));
    this.personalAlerts.set(this.personalAlerts().map(a => (!a.is_read ? { ...a, is_read: true } : a)));
    this.markingAll.set(false);
  }

  async onRefresh(event: any) {
    try {
      await this.load();
    } finally {
      event.target.complete();
    }
  }
}
