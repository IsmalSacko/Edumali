import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, Platform } from '@ionic/angular';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { EvaluationDetailModalComponent } from '../eval-modal/evaluation-detail-modal.component';

@Component({
  selector: 'app-evaluation-component',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './evaluation-component.html',
  styleUrls: ['./evaluation-component.css'],
})
export class EvaluationComponent implements OnInit  {
  private evalService = inject(EvaluationService);
  private modalCtrl = inject(ModalController);
  private platform = inject(Platform);

  evaluations: any[] = [];

  ngOnInit(): void {
    this.loadEvaluations();
  }

  async loadEvaluations(): Promise<void> {
    const evaluations = await this.evalService.getAll();
    this.evaluations = Array.isArray(evaluations) ? evaluations : [];
    console.log('Loaded evaluations:', this.evaluations);
  }

  trackByEval(index: number, item: any) {
    return item?.id ?? index;
  }

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    if (img) img.src = '/logo-edumali.png';
  }

  async openEvaluation(e: any) {
    if (!e) return;
    try {
      const modal = await this.modalCtrl.create({
        component: EvaluationDetailModalComponent,
        componentProps: { evaluation: e },
        breakpoints: [0.25, 0.6, 0.95],
        initialBreakpoint: 0.6,
      });
      await modal.present();
      await modal.onDidDismiss();
    } catch (err) {
      console.warn('Failed to open modal', err);
    }
  }
}
