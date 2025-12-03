import { Component, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import Chart from 'chart.js/auto';
import { AuthService } from '../../../services/auth/auth.service';
import { DashboardService } from '../../../services/dashboard/dashboard.service';

import { environment } from '../../../../environments/environment';
import { NabarComponent } from "../../header/nabar-component/nabar-component";

@Component({
  selector: 'app-dashboard-component',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, RouterLink],
  templateUrl: './dashboard-component.html',
  styleUrls: ['./dashboard-component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private dashboardService = inject(DashboardService);
  private readonly base = environment.imageUrl;
 
  stats: any;
  nextClasses: any;
  currentUser: any;
  private studentsByCycleChart: any = null;
  private viewInitialized = false;
  private pendingRender = false;


  async ngOnInit(): Promise<void> {
    // Initialisation des données du tableau de bord
    try {
    
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
    // Defer rendering until view is initialized
    if (this.viewInitialized) {
      this.renderStudentsByCycleChart();
      this.initKpiCharts();
    } else {
      this.pendingRender = true;
    }
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (this.pendingRender && this.stats) {
      this.renderStudentsByCycleChart();
      this.initKpiCharts();
      this.pendingRender = false;
    }
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

  // KPI charts: sparklines for counts and gauge for average
  private studentsSparkline: any = null;
  private teachersSparkline: any = null;
  private classesSparkline: any = null;
  private averageGauge: any = null;

  private initKpiCharts(): void {
    try {
      // destroy existing
      try { this.studentsSparkline?.destroy(); } catch (e) {}
      try { this.teachersSparkline?.destroy(); } catch (e) {}
      try { this.classesSparkline?.destroy(); } catch (e) {}
      try { this.averageGauge?.destroy(); } catch (e) {}

      // Prepare small datasets: if you have history, use it; otherwise derive simple array from current value
      const studentsVal = Number(this.stats?.totalStudents ?? 0);
      const teachersVal = Number(this.stats?.totalTeachers ?? 0);
      const classesVal = Number(this.stats?.totalClasses ?? 0);

      const makeSeries = (v: number) => {
        // small trend: v-2, v-1, v, v+1, v+2 (clamped >=0)
        return [Math.max(0, v-2), Math.max(0, v-1), v, v+1, v+2];
      };

      const sData = makeSeries(studentsVal);
      const tData = makeSeries(teachersVal);
      const cData = makeSeries(classesVal);

      const sCtx = (document.getElementById('studentsSparkline') as HTMLCanvasElement | null)?.getContext('2d');
      const tCtx = (document.getElementById('teachersSparkline') as HTMLCanvasElement | null)?.getContext('2d');
      const cCtx = (document.getElementById('classesSparkline') as HTMLCanvasElement | null)?.getContext('2d');
      const gCtx = (document.getElementById('averageGauge') as HTMLCanvasElement | null)?.getContext('2d');

      const commonSparkOptions: any = {
        type: 'line',
        data: { labels: sData.map((_,i)=>i), datasets: [{ data: sData, borderColor: '#3f51b5', backgroundColor: 'rgba(63,81,181,0.12)', fill: true, tension: 0.3, pointRadius: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
      };

      if (sCtx) {
        this.studentsSparkline = new Chart(sCtx, JSON.parse(JSON.stringify(commonSparkOptions)).data ? commonSparkOptions : null);
        // replace dataset data for correct values
        try { this.studentsSparkline.data.datasets[0].data = sData; this.studentsSparkline.update(); } catch(e){}
      }
      if (tCtx) {
        const opt = JSON.parse(JSON.stringify(commonSparkOptions));
        opt.data.datasets[0].borderColor = '#2196F3'; opt.data.datasets[0].backgroundColor = 'rgba(33,150,243,0.12)';
        this.teachersSparkline = new Chart(tCtx, opt);
        try { this.teachersSparkline.data.datasets[0].data = tData; this.teachersSparkline.update(); } catch(e){}
      }
      if (cCtx) {
        const opt = JSON.parse(JSON.stringify(commonSparkOptions));
        opt.data.datasets[0].borderColor = '#FF9800'; opt.data.datasets[0].backgroundColor = 'rgba(255,152,0,0.12)';
        this.classesSparkline = new Chart(cCtx, opt);
        try { this.classesSparkline.data.datasets[0].data = cData; this.classesSparkline.update(); } catch(e){}
      }

      // Average gauge
      if (gCtx) {
        const avg = Number(this.stats?.averageGlobal ?? 0);
        // map average (assume 0..20) to percent
        const percent = Math.round(Math.max(0, Math.min(100, (avg <= 20 ? (avg/20)*100 : avg))));
        const gData = [percent, 100 - percent];
        const gaugeCfg: any = {
          type: 'doughnut',
          data: { datasets: [{ data: gData, backgroundColor: ['#4CAF50', '#eee'], borderWidth: 0 }] },
          options: { cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } }, responsive: true, maintainAspectRatio: false }
        };
        this.averageGauge = new Chart(gCtx, gaugeCfg);
        // update label text
        const lbl = document.getElementById('averageLabel');
        if (lbl) lbl.textContent = (this.stats?.averageGlobal ?? '—').toString();
      }

      // animate mini-bars widths (relative to max)
      const maxCount = Math.max(1, studentsVal, teachersVal, classesVal);
      const setWidth = (id: string, val: number) => {
        const el = document.getElementById(id) as HTMLElement | null;
        if (!el) return;
        const pct = Math.round((val / maxCount) * 100);
        el.style.width = pct + '%';
      };
      setWidth('studentsMiniBar', studentsVal);
      setWidth('teachersMiniBar', teachersVal);
      setWidth('classesMiniBar', classesVal);
      // for average, set by percent
      const avgPct = Math.round(Math.max(0, Math.min(100, (Number(this.stats?.averageGlobal ?? 0) <= 20 ? (Number(this.stats?.averageGlobal ?? 0)/20)*100 : Number(this.stats?.averageGlobal ?? 0)))));
      const avgEl = document.getElementById('averageMiniBar') as HTMLElement | null;
      if (avgEl) avgEl.style.width = avgPct + '%';

    } catch (e) {
      console.warn('Error initializing KPI charts', e);
    }
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

  onProfileImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    img.src = '/logo-edumali.png';
    img.style.objectFit = 'cover';
  }
}