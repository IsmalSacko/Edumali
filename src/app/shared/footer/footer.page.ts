import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { IonIcon, IonFooter, IonPopover, IonList, IonItem, IonContent, IonButton, IonLabel } from '@ionic/angular/standalone';

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
  checkmarkOutline,
} from 'ionicons/icons';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.page.html',
  styleUrls: ['./footer.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonIcon,
    IonFooter,
    IonPopover,
    IonList,
    IonItem,
    IonContent,
    IonButton,
    IonLabel,
  ]
})
export class FooterPage implements OnInit {

  private router = inject(Router);
  themeService = inject(ThemeService);

  // True = mobile, False = web/desktop
  isMobile = signal<boolean>(false);
  themeMenuOpen = signal<boolean>(false);
  themePopoverEvent: Event | null = null;

  constructor() {
    addIcons({
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
      checkmarkOutline,
    });
  }

  ngOnInit() {
    this.detectMobile();
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
}
