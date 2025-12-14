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
  moonOutline, 
  checkmarkOutline 
} from 'ionicons/icons';
import { AuthService } from '../../services/auth/auth.service';
import { ThemeService } from '../../services/theme.service';
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
    //IonAvatar,
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
  themeService = inject(ThemeService);

  currentUser = this.auth.user;
  profileMenuOpen = signal<boolean>(false);
  themeMenuOpen = signal<boolean>(false);
  profilePopoverEvent: Event | null = null;
  themePopoverEvent: Event | null = null;

  constructor() {
    addIcons({peopleOutline,schoolOutline,layersOutline,calendarOutline,clipboardOutline,barChartOutline,settingsOutline,menuOutline,homeOutline,personCircleOutline,logOutOutline,checkmarkOutline,moonOutline,});
  }

  async ngOnInit() {
    // Rien à faire : le signal est déjà géré globalement par AuthService
  }

  get avatar() {
    const photo = this.currentUser()?.profile_photo;
    return photo?.startsWith('http') ? photo : photo ? `${environment.imageUrl}${photo}` : 'assets/logo-edumali.png';
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }

  openProfileMenu(ev: Event) {
    this.profilePopoverEvent = ev;
    this.profileMenuOpen.set(true);
  }

  closeProfileMenu() {
    this.profileMenuOpen.set(false);
  }

  openThemeMenu(ev: Event) {
    this.themePopoverEvent = ev;
    this.themeMenuOpen.set(true);
  }

  closeThemeMenu() {
    this.themeMenuOpen.set(false);
  }

  selectTheme(themeName: string) {
    this.themeService.setTheme(themeName as any);
    this.closeThemeMenu();
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

}
