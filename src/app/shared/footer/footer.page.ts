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
  checkmarkOutline, calendarOutline
} from 'ionicons/icons';
import { ThemeService } from '../../services/theme.service';
import { EmploisService } from 'src/app/services/emplois-du-temps/emplois-service';

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

  // True = mobile, False = web/desktop
  isMobile = signal<boolean>(false);
  themeMenuOpen = signal<boolean>(false);
  themePopoverEvent: Event | null = null;
  EmploisCount = signal<number | null>(null);
  constructor() {
    addIcons({ homeOutline, peopleOutline, schoolOutline, calendarOutline, clipboardOutline, moonOutline, settingsOutline, checkmarkOutline, logoFacebook, logoTwitter, logoLinkedin, informationCircleOutline, callOutline, });
  }

  ngOnInit() {
    this.detectMobile();
    this.loadEmploisCount();
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
    const emplois = await this.EmploiService.getAll();
    this.EmploisCount.set(this.EmploiService.countEmplois(emplois));
  }
}