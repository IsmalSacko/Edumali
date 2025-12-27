import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonCard } from '@ionic/angular/standalone';
import { closeCircleOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-admin-restricted-modal',
    standalone: true,
    imports: [CommonModule, IonContent, IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonCard],
    templateUrl: './admin-restricted-modal.component.html',
    styleUrls: ['./admin-restricted-modal.component.scss']
})
export class AdminRestrictedModalComponent {
    // expose the icon constant to the template
    readonly closeCircleOutline = closeCircleOutline;
    router = inject(Router);
    private modalCtrl = inject(ModalController);
    async close(path: string) {
        await this.modalCtrl.dismiss({ path });
    }
}
