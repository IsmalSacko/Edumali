import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonPopover, IonDatetime, IonButtons, IonMenuButton, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { EmploisService } from 'src/app/services/emplois-du-temps/emplois-service';
import { EvaluationService } from 'src/app/services/evaluation/evaluation.service';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';


@Component({
  selector: 'app-stat',
  templateUrl: './stat.page.html',
  styleUrls: ['./stat.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonPopover,
    IonDatetime,
    CanvasJSAngularChartsModule,
    IonButtons,
    IonMenuButton,
    IonSegment,
    IonSegmentButton
  ]
})
export class StatPage implements OnInit {
  showDatePopover = false;
  selectedDate: string | null = null;

  private dashboardService = inject(DashboardService);
  private emploisService = inject(EmploisService);
  private evaluationService = inject(EvaluationService);

  stats: any = null;
  evalEntries: Array<{ label: string; value: number }> = [];
  pieSegments: any[] = [];
  pieTotal = 0;
  emploisItems: any[] = [];
  emploisCount = 0;
  emploisByDay: Record<number, any[]> = {};

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
        indexLabelFontColor: '#ffffff',
        toolTipContent: '{label}: <strong>{y}</strong> ({percentage}%)',
        dataPoints: []
      }
    ]
  };

  constructor() { }

  ngOnInit() {
    this.loadData();
  }

  private makePie(items: Array<{ key: string; label: string; value: number }>, colors: Record<string, string>) {
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

      this.stats = stats;

      // evaluations: prefer service data, fallback to dashboard
      if (evs && evs.length) {
        const counts: Record<string, number> = { '1': 0, '2': 0, '3': 0 };
        evs.forEach((ev: any) => {
          const t = String(ev.trimester ?? ev.trimestre ?? ev.trimestre_id ?? '1');
          counts[t] = (counts[t] || 0) + 1;
        });
        this.evalEntries = Object.keys(counts).map(k => ({ label: `T${k}`, value: counts[k] }));
      } else {
        const eobj = this.stats?.evaluationsByTrimester ?? {};
        this.evalEntries = Object.keys(eobj).map(k => ({ label: k, value: Number(eobj[k] ?? 0) }));
      }

      // update chart
      this.evals = { ...this.evals, data: [{ ...this.evals.data[0], dataPoints: this.evalEntries.map(e => ({ label: e.label, y: e.value })) }] };

      // pie (students by cycle)
      const sbc = this.stats?.studentsByCycle ?? { primaire: 0, secondaire: 0, lycee: 0 };
      const items = [
        { key: 'primaire', label: 'Primaire', value: Number(sbc.primaire ?? 0) },
        { key: 'secondaire', label: 'Secondaire', value: Number(sbc.secondaire ?? 0) },
        { key: 'lycee', label: 'Lycée', value: Number(sbc.lycee ?? 0) }
      ];
      const colors = { primaire: '#4caf50', secondaire: '#2196f3', lycee: '#ff9800' };
      this.pieSegments = this.makePie(items, colors);

      // emplois
      this.emploisItems = emplois as any[];
      this.emploisCount = this.emploisService.countEmplois(this.emploisItems);
      this.emploisByDay = this.emploisService.groupByDay(this.emploisItems);
    } catch (err) {
      console.error('loadData failed', err);
    }
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
