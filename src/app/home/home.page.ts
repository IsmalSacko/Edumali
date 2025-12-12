import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  schoolOutline,
  peopleCircleOutline,
  bookOutline,
  statsChartOutline,
} from 'ionicons/icons';
import { DashboardService, DashboardStats } from '../services/dashboard/dashboard.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
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
    DecimalPipe,
  ],
})
export class HomePage {
  private dashboardService = inject(DashboardService);

  stats = signal<DashboardStats | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  constructor() {
    addIcons({
      peopleOutline,
      schoolOutline,
      peopleCircleOutline,
      bookOutline,
      statsChartOutline,
    });
    this.loadStats();
  }

  async loadStats() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.dashboardService.getStats();
      this.stats.set(data);
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
