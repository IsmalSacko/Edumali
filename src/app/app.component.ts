import { Component, inject, effect } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router, NavigationStart } from '@angular/router';
import { NavPage } from "./shared/nav/nav.page";
import { FooterPage } from './shared/footer/footer.page';
import { AuthService } from './services/auth/auth.service';
import { AdminRestrictedModalComponent } from './shared/modals/admin-restricted-modal/admin-restricted-modal.component';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonicModule, NavPage, FooterPage],
})
export class AppComponent {
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private auth = inject(AuthService);

  constructor() {
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationStart) {
        const active = document.activeElement as HTMLElement | null;
        if (active && typeof active.blur === 'function') {
          active.blur();
        }
      }
    });

    // Watch for requests to show admin modal and present it from this component
    effect(() => {
      if (this.auth.showAdminModal()) {
        // present asynchronously
        void this.presentAdminModal();
      }
    });
  }

  private async presentAdminModal() {
    try {
      const modal = await this.modalCtrl.create({
        component: AdminRestrictedModalComponent,
        cssClass: 'admin-restricted-modal',
        backdropDismiss: false,
      });
      await modal.present();
      const { data } = await modal.onDidDismiss();
      // If modal returned a path, navigate there, otherwise go to /unauthorized
      if (data && data.path) {
        try { this.router.navigateByUrl(data.path); } catch (e) { console.warn('Navigation after modal dismiss failed:', e); }
      } else {
        try { this.router.navigateByUrl('/unauthorized'); } catch (e) { console.warn('Navigation to /unauthorized failed:', e); }
      }
    } catch (e) {
    } finally {
      // reset signal and redirect to unauthorized page
      try { this.auth.showAdminModal.set(false); } catch { }
    }
  }
}
