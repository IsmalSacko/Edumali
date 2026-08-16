import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { schoolOutline, colorPaletteOutline, checkmarkOutline, cloudUploadOutline, moonOutline } from 'ionicons/icons';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { ThemeService, ThemeName } from '../../services/theme.service';
import { SchoolProfile } from '../../models/altert/alert';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSpinner,
  ],
})
export class SettingsPage implements OnInit {
  private dashboardService = inject(DashboardService);
  themeService = inject(ThemeService);

  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  profile = signal<SchoolProfile | null>(null);

  name = signal<string>('');
  logoFile = signal<File | null>(null);
  cachetFile = signal<File | null>(null);
  signatureFile = signal<File | null>(null);
  logoPreview = signal<string | null>(null);
  cachetPreview = signal<string | null>(null);
  signaturePreview = signal<string | null>(null);

  constructor() {
    addIcons({ schoolOutline, colorPaletteOutline, checkmarkOutline, cloudUploadOutline, moonOutline });
  }

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading.set(true);
    const profile = await this.dashboardService.getSchoolProfile();
    this.profile.set(profile);
    this.name.set(profile?.name ?? '');
    this.loading.set(false);
  }

  onFileSelected(event: Event, kind: 'logo' | 'cachet' | 'signature') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);

    if (kind === 'logo') {
      this.logoFile.set(file);
      this.logoPreview.set(previewUrl);
    } else if (kind === 'cachet') {
      this.cachetFile.set(file);
      this.cachetPreview.set(previewUrl);
    } else {
      this.signatureFile.set(file);
      this.signaturePreview.set(previewUrl);
    }
  }

  async save() {
    this.saving.set(true);
    const result = await this.dashboardService.saveSchoolProfile(this.profile()?.id, {
      name: this.name(),
      logo: this.logoFile() ?? undefined,
      cachet: this.cachetFile() ?? undefined,
      signature_directeur: this.signatureFile() ?? undefined,
    });
    this.saving.set(false);
    if (result) {
      this.profile.set(result);
      this.logoFile.set(null);
      this.cachetFile.set(null);
      this.signatureFile.set(null);
    }
  }

  selectTheme(name: ThemeName) {
    this.themeService.setTheme(name);
  }
}
