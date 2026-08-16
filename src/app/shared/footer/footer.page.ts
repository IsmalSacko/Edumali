import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { IonIcon, IonFooter, IonPopover, IonList, IonItem, IonContent, IonButton, IonLabel, IonTabButton, IonBadge } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  homeOutline,
  peopleOutline,
  schoolOutline,
  clipboardOutline,
  settingsOutline,
  logoFacebook,
  logoTwitter,
  logoLinkedin,
  informationCircleOutline,
  callOutline,
  moonOutline,
  checkmarkOutline, calendarOutline,
  chatbubbleOutline,
  notificationsOutline,
} from 'ionicons/icons';
import { ThemeService } from '../../services/theme.service';
import { EmploisService } from 'src/app/services/emplois-du-temps/emplois-service';
import { MessagingService } from 'src/app/services/messaging/messaging.service';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.page.html',
  styleUrls: ['./footer.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonIcon,
    IonPopover,
    IonList,
    IonItem,
    IonContent,
    IonLabel,
    IonBadge
  ]
})
export class FooterPage implements OnInit {

  private router = inject(Router);
  themeService = inject(ThemeService);
  EmploiService = inject(EmploisService);
  private messagingService = inject(MessagingService);
  private auth = inject(AuthService);

  // True = mobile, False = web/desktop
  isMobile = signal<boolean>(false);
  themeMenuOpen = signal<boolean>(false);
  themePopoverEvent: Event | null = null;
  EmploisCount = signal<number | null>(null);
  unreadMessages = this.messagingService.unreadCount;
  currentUser = this.auth.user;

  constructor() {
    addIcons({ homeOutline, peopleOutline, schoolOutline, calendarOutline, clipboardOutline, moonOutline, settingsOutline, checkmarkOutline, logoFacebook, logoTwitter, logoLinkedin, informationCircleOutline, callOutline, chatbubbleOutline, notificationsOutline });
  }

  ngOnInit() {
    this.detectMobile();
    if (this.auth.access) {
      this.loadEmploisCount();
      this.messagingService.refreshUnreadCount();
    }
    window.addEventListener('resize', () => this.detectMobile());
  }

  private detectMobile() {
    this.isMobile.set(window.innerWidth < 768);
  }

  navigate(path: string) {
    this.router.navigateByUrl(path);
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

  async loadEmploisCount() {
    try {
      const emplois = await this.EmploiService.getAll();
      this.EmploisCount.set(this.EmploiService.countEmplois(emplois));
    } catch {
      // silencieux : le badge garde simplement sa valeur précédente
    }
  }
}