import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonPopover, IonDatetime, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { EmploisService } from 'src/app/services/emplois-du-temps/emplois-service';
import { EvaluationService } from 'src/app/services/evaluation/evaluation.service';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { StatService } from 'src/app/services/stats/stat-service';
import { DashboardStats } from 'src/app/models/dashboard/dashboard';
import { barChart, star, starOutline } from 'ionicons/icons';


@Component({
  selector: 'app-stat',
  templateUrl: './stat.page.html',
  styleUrls: ['./stat.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonPopover,
    IonDatetime,
    CanvasJSAngularChartsModule,
    IonSegment,
    IonSegmentButton,
    IonButton
  ]
})
export class StatPage implements OnInit {
  barChart = barChart;
  starOutline = star;
  startt = starOutline
  showDatePopover = false;
  selectedDate: string | null = null;

  private dashboardService = inject(DashboardService);
  private emploisService = inject(EmploisService);
  private mystatService = inject(StatService);
  private evaluationService = inject(EvaluationService);
  private cdr = inject(ChangeDetectorRef);

  stats: any = null;
  mystat!: DashboardStats;
  evalEntries: Array<{ label: string; value: number }> = [];
  pieSegments: any[] = [];
  pieTotal = 0;
  emploisItems: any[] = [];
  emploisCount = 0;
  emploisByDay: Record<number, any[]> = {};
  dataReady = false;

  chartVisible = true;

  // raw data caches so we can re-filter on period change
  private rawStats: any = null;
  private rawEvals: any[] = [];
  private rawEmplois: any[] = [];

  // current selected period: 'all' | 'month' | 'quarter' | 'year'
  // default to 'month' so page shows data on first load (matches previous UI expectation)
  period: 'all' | 'month' | 'quarter' | 'year' = 'month';

  // CanvasJS options — title removed so we control header with HTML
  evals: any = {
    animationEnabled: true,
    // place legend vertically on the right so it matches the SVG donut layout
    legend: {
      horizontalAlign: 'right',
      verticalAlign: 'center',
      fontSize: 13,
      itemMaxWidth: 200
    },
    data: [
      {
        type: 'doughnut',
        innerRadius: '60%',
        showInLegend: true,
        legendText: '{label} {y}',
        indexLabel: '{y}%',

        toolTipContent: '{label}: <strong>{y}</strong> ({percentage}%)',
        dataPoints: []
      }
    ]
  };

  constructor() { }

  async ngOnInit() {
    this.loadData();
    await this.loadMyStats();
  }
  async loadMyStats() {
    this.mystat = await this.mystatService.MyStats();

  }
  makePie(items: Array<{ key: string; label: string; value: number }>, colors: Record<string, string>) {
    const total = items.reduce((s, it) => s + it.value, 0);
    this.pieTotal = total;
    const cx = 120,
      cy = 80,
      r = 64;
    if (total <= 0) {
      return [
        {
          d: `M ${cx} ${cy} m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`,
          color: '#e0e0e0',
          label: 'Aucun',
          value: 0,
          percent: 0
        }
      ];
    }
    const toXY = (deg: number) => {
      const a = (deg - 90) * (Math.PI / 180);
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    };
    let start = 0;
    const segments: any[] = [];
    for (const it of items) {
      const ang = (it.value / total) * 360;
      const end = start + ang;
      const large = ang > 180 ? 1 : 0;
      const p1 = toXY(start);
      const p2 = toXY(end);
      const d = `M ${cx} ${cy} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`;
      segments.push({ d, color: colors[it.key] ?? '#9e9e9e', label: it.label, value: it.value, percent: (it.value / total) * 100 });
      start = end;
    }
    return segments;
  }

  async loadData() {

    try {
      const [stats, evs, emplois] = await Promise.all([
        this.dashboardService.getStats().catch(() => null),
        this.evaluationService.getAll({ page_size: 1000 }).catch(() => []),
        this.emploisService.getAll().catch(() => [])
      ]);

      // cache raw data
      this.rawStats = stats;
      this.rawEvals = evs || [];
      this.rawEmplois = emplois || [];

      // initial apply current period
      this.applyPeriodFilter();

      // mark ready so template renders
      this.dataReady = true;
      this.cdr.detectChanges();

      // (we now use applyPeriodFilter to derive displayed values)
    } catch (err) {
      console.error('loadData failed', err);
    }
  }

  // called when the segment changes
  onPeriodChange(e: any) {
    const v = e.detail?.value;
    if (v) {
      this.period = v;
      this.applyPeriodFilter();
    }
  }

  // determine start/end for current period (uses selectedDate if set)
  private getPeriodRange() {
    const now = this.selectedDate ? new Date(this.selectedDate) : new Date();
    const y = now.getFullYear();
    if (this.period === 'year') {
      const start = new Date(y, 0, 1, 0, 0, 0);
      const end = new Date(y, 11, 31, 23, 59, 59);
      return { start, end };
    }
    if (this.period === 'quarter') {
      // determine quarter number
      const m = now.getMonth();
      const q = Math.floor(m / 3); // 0..3
      const start = new Date(y, q * 3, 1, 0, 0, 0);
      const end = new Date(y, q * 3 + 3, 0, 23, 59, 59); // last day of quarter
      return { start, end };
    }
    // default: month
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  }

  // helper: try to extract a Date from different item shapes
  private extractDate(item: any): Date | null {
    if (!item) return null;
    const candidates = [
      'date', 'created_at', 'createdAt', 'start', 'date_debut', 'date_start', 'heure_debut', 'debut'
    ];
    for (const k of candidates) {
      if (item[k]) {
        const d = new Date(item[k]);
        if (!isNaN(d.getTime())) return d;
      }
    }
    // try nested checks
    if (item.matiere && item.matiere.date) {
      const d = new Date(item.matiere.date);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }

  // compute and apply filtered data for current period
  private applyPeriodFilter() {
    // prepare: clear current view entries (don't hide container)
    this.evalEntries = [];
    this.pieSegments = [];

    // If user wants to see everything, just use raw caches
    if (this.period === 'all') {
      this.stats = this.rawStats ?? {};
      const evs = this.rawEvals || [];
      // choose best aggregation for 'Tous'
      const hasTrimester = (evs || []).some(ev => ev?.trimester || ev?.trimestre || ev?.trimestre_id);
      const hasDate = (evs || []).some(ev => !!this.extractDate(ev));
      const modeForAll: 'quarter' | 'month' | 'year' | 'total' = hasTrimester ? 'quarter' : (hasDate ? 'year' : 'total');
      this.buildEvalEntriesFrom(evs, modeForAll);

      const sbc = this.rawStats?.studentsByCycle ?? { primaire: 0, secondaire: 0, lycee: 0 };
      this.pieSegments = this.makePie([
        { key: 'primaire', label: 'Primaire', value: Number(sbc.primaire ?? 0) },
        { key: 'secondaire', label: 'Secondaire', value: Number(sbc.secondaire ?? 0) },
        { key: 'lycee', label: 'Lycée', value: Number(sbc.lycee ?? 0) }
      ], { primaire: '#4caf50', secondaire: '#2196f3', lycee: '#ff9800' });

      this.emploisItems = this.rawEmplois || [];
      this.emploisCount = this.emploisService.countEmplois(this.emploisItems);
      this.emploisByDay = this.emploisService.groupByDay(this.emploisItems);
      // restore visibility and force chart re-creation to trigger CanvasJS animation
      this.dataReady = true;
      this.chartVisible = false;
      this.cdr.detectChanges();
      setTimeout(() => { this.chartVisible = true; this.cdr.detectChanges(); }, 50);
      return;
    }

    const { start, end } = this.getPeriodRange();

    // Client-side filtering only: filter evaluations and emplois immediately
    const evs = (this.rawEvals || []).filter((ev: any) => {
      const d = this.extractDate(ev);
      if (!d) return true;
      return d >= start && d <= end;
    });

    this.buildEvalEntriesFrom(evs, this.period);

    const sbc = this.rawStats?.studentsByCycle ?? { primaire: 0, secondaire: 0, lycee: 0 };
    this.pieSegments = this.makePie([
      { key: 'primaire', label: 'Primaire', value: Number(sbc.primaire ?? 0) },
      { key: 'secondaire', label: 'Secondaire', value: Number(sbc.secondaire ?? 0) },
      { key: 'lycee', label: 'Lycée', value: Number(sbc.lycee ?? 0) }
    ], { primaire: '#4caf50', secondaire: '#2196f3', lycee: '#ff9800' });

    const ems = (this.rawEmplois || []).filter((ex: any) => {
      const d = this.extractDate(ex) || (ex?.date ? new Date(ex.date) : null);
      if (!d) return true;
      return d >= start && d <= end;
    });
    this.emploisItems = ems;
    this.emploisCount = this.emploisService.countEmplois(this.emploisItems);
    this.emploisByDay = this.emploisService.groupByDay(this.emploisItems);

    // ensure KPIs show something — fallback to rawStats when filtered stats unavailable
    this.stats = this.rawStats ?? {};

    // show results immediately and force chart redraw
    this.dataReady = true;
    this.cdr.detectChanges();
    this.chartVisible = false;
    setTimeout(() => { this.chartVisible = true; this.cdr.detectChanges(); }, 50);

    // emplois already filtered and assigned above
  }

  private buildEvalEntriesFrom(evs: any[], mode: 'quarter' | 'month' | 'year' | 'total') {
    if (mode === 'quarter') {
      const counts: Record<string, number> = { '1': 0, '2': 0, '3': 0 };
      (evs || []).forEach((ev: any) => {
        const t = String(ev.trimester ?? ev.trimestre ?? ev.trimestre_id ?? '1');
        counts[t] = (counts[t] || 0) + 1;
      });
      this.evalEntries = Object.keys(counts).map(k => ({ label: `T${k}`, value: counts[k] }));
    } else if (mode === 'month') {
      // group by week of month (1..5)
      const counts: Record<string, number> = {};
      (evs || []).forEach((ev: any) => {
        const d = this.extractDate(ev);
        const day = d ? d.getDate() : null;
        const w = day ? (Math.floor((day - 1) / 7) + 1) : 1;
        const k = `S${w}`;
        counts[k] = (counts[k] || 0) + 1;
      });
      let keys = Object.keys(counts);
      // fallback: if all dates missing (single key) and evaluations have trimester info, group by trimester instead
      if (keys.length <= 1 && (evs || []).some(ev => ev.trimester || ev.trimestre || ev.trimestre_id)) {
        const countsT: Record<string, number> = {};
        (evs || []).forEach((ev: any) => {
          const t = String(ev.trimester ?? ev.trimestre ?? ev.trimestre_id ?? '1');
          const k = `T${t}`;
          countsT[k] = (countsT[k] || 0) + 1;
        });
        this.evalEntries = Object.keys(countsT).map(k => ({ label: k, value: countsT[k] }));
      } else {
        this.evalEntries = keys.map(k => ({ label: k, value: counts[k] }));
      }
    } else if (mode === 'year') {
      // group by month
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const counts: Record<string, number> = {};
      (evs || []).forEach((ev: any) => {
        const d = this.extractDate(ev);
        const m = d ? d.getMonth() : 0;
        const k = months[m] || `M${m + 1}`;
        counts[k] = (counts[k] || 0) + 1;
      });
      let keys = Object.keys(counts);
      // fallback: if no date info and trimester exists, group by trimester for yearly view
      if (keys.length <= 1 && (evs || []).some(ev => ev.trimester || ev.trimestre || ev.trimestre_id)) {
        const countsT: Record<string, number> = {};
        (evs || []).forEach((ev: any) => {
          const t = String(ev.trimester ?? ev.trimestre ?? ev.trimestre_id ?? '1');
          const k = `T${t}`;
          countsT[k] = (countsT[k] || 0) + 1;
        });
        this.evalEntries = Object.keys(countsT).map(k => ({ label: k, value: countsT[k] }));
      } else {
        this.evalEntries = keys.map(k => ({ label: k, value: counts[k] }));
      }
    } else {
      const total = (evs || []).length;
      this.evalEntries = [{ label: 'Total', value: total }];
    }

    // update chart
    this.evals = { ...this.evals, data: [{ ...this.evals.data[0], dataPoints: this.evalEntries.map(e => ({ label: e.label, y: e.value })) }] };
  }

  // convenience getter for total evaluations currently displayed
  get evalsTotal(): number {
    return (this.evalEntries || []).reduce((s, e) => s + (e.value || 0), 0);
  }



  get periodLabel(): string {
    if (this.period === 'all') return 'Toutes périodes';
    if (this.period === 'month') return 'Mois courant';
    if (this.period === 'quarter') return 'Trimestre courant';
    return 'Année courante';
  }

  openDatePicker(_: Event) {
    this.showDatePopover = true;
  }

  onDateChange(e: any) {
    this.selectedDate = e.detail?.value ?? null;
    this.showDatePopover = false;
  }

  onPopoverDismiss() {
    this.showDatePopover = false;
  }

}
