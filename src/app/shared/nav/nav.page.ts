import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonAvatar,
  IonButton,
  IonIcon,
  IonLabel,
  IonPopover,
  IonList,
  IonItem,
  IonContent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  menuOutline,
  homeOutline,
  peopleOutline,
  schoolOutline,
  layersOutline,
  calendarOutline,
  clipboardOutline,
  barChartOutline,
  settingsOutline,
  personCircleOutline,
  logOutOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.page.html',
  styleUrls: ['./nav.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonAvatar,
    IonButton,
    IonIcon,
    IonLabel,
    IonPopover,
    IonList,
    IonItem,
    IonContent,
  ]
})
export class NavPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  currentUser = signal<any | null>(null);

  constructor() {
    addIcons({
      menuOutline,
      homeOutline,
      peopleOutline,
      schoolOutline,
      layersOutline,
      calendarOutline,
      clipboardOutline,
      barChartOutline,
      settingsOutline,
      personCircleOutline,
      logOutOutline,
    });
  }

  async ngOnInit() {
    await this.loadUser();
  }

  async loadUser() {
    try {
      const user = await this.auth.currentUser();
      this.currentUser.set(user);
    } catch (err) {
      this.currentUser.set(null);
    }
  }

  get avatar() {
    const photo = this.currentUser()?.profile_photo;
    return photo?.startsWith('http') ? photo : photo ? `${environment.imageUrl}${photo}` : 'assets/logo-edumali.png';
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

}
