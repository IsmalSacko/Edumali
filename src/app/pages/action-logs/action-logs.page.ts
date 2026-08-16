import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonSearchbar,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline, refreshOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { ActionLog } from '../../models/altert/alert';

@Component({
  selector: 'app-action-logs',
  standalone: true,
  templateUrl: './action-logs.page.html',
  styleUrls: ['./action-logs.page.scss'],
  imports: [
    CommonModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonSearchbar,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class ActionLogsPage implements OnInit {
  private dashboardService = inject(DashboardService);

  loading = signal<boolean>(true);
  logs = signal<ActionLog[]>([]);
  searchText = signal<string>('');
  currentPage = signal<number>(1);
  readonly pageSize = 20;

  filteredLogs = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    if (!term) return this.logs();
    return this.logs().filter(l => {
      const user = l.user_info ? `${l.user_info.first_name ?? ''} ${l.user_info.last_name ?? ''} ${l.user_info.username ?? ''}` : '';
      return (
        l.action.toLowerCase().includes(term) ||
        l.description.toLowerCase().includes(term) ||
        user.toLowerCase().includes(term)
      );
    });
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredLogs().length / this.pageSize)));

  pagedLogs = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredLogs().slice(start, start + this.pageSize);
  });

  constructor() {
    addIcons({ documentTextOutline, refreshOutline, chevronBackOutline, chevronForwardOutline });
  }

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    this.logs.set(await this.dashboardService.getActionLogs(500));
    this.loading.set(false);
  }

  onSearchChange(value: string) {
    this.searchText.set(value);
    this.currentPage.set(1);
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  userLabel(log: ActionLog): string {
    if (!log.user_info) return 'Système';
    const name = `${log.user_info.first_name ?? ''} ${log.user_info.last_name ?? ''}`.trim();
    return name || log.user_info.username || 'Utilisateur';
  }

  async onRefresh(event: any) {
    try {
      await this.load();
    } finally {
      event.target.complete();
    }
  }
}
