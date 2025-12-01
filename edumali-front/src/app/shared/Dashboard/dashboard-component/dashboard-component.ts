import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../services/auth/auth.service.ts';
import { DashboardService } from '../../../services/dashboard/dashboard.service.ts.js';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, RouterLink],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.css'],
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dashboardService = inject(DashboardService);
 
  stats: any;
  nextClasses: any;
  currentUser: any;
  private studentsByCycleChart: any = null;

  async ngOnInit(): Promise<void> {
    // Initialisation des données du tableau de bord
    try {
      this.currentUser = await this.authService.currentUser();
      await this.loadStats();
      console.log('Current User:', this.currentUser);
    } catch (err) {
      console.warn('Error loading current user', err);
      // If not authorized, redirect to login
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
  
  async loadStats(): Promise<void> {
    this.stats = await this.dashboardService.getStats();
    console.log('Dashboard Stats:', this.stats);
    // Render a small doughnut chart showing students by cycle
    this.renderStudentsByCycleChart();
  }

  private renderStudentsByCycleChart(): void {
    const dataObj = this.stats?.studentsByCycle ?? {};
    const labels = Object.keys(dataObj);
    const data = labels.map((k) => Number(dataObj[k]) || 0);

    const canvas = document.getElementById('studentsByCycleChart') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.studentsByCycleChart) {
      try { this.studentsByCycleChart.destroy(); } catch (e) { /* ignore */ }
    }

    this.studentsByCycleChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data, backgroundColor: ['#4CAF50', '#FFC107', '#2196F3', '#9C27B0', '#FF5722'] }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
    });
  }

  ngOnDestroy(): void {
    if (this.studentsByCycleChart) {
      try { this.studentsByCycleChart.destroy(); } catch (e) { /* ignore */ }
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}