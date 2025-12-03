import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-eval-detail-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './evaluation-detail-modal.component.html',
  styleUrls: ['./evaluation-detail-modal.component.css'],
})
export class EvaluationDetailModalComponent {
  @Input() evaluation: any;

  constructor(private modalCtrl: ModalController) {}

  close() {
    this.modalCtrl.dismiss();
  }
}
