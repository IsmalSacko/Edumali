import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonAvatar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonBadge,
  IonSkeletonText,
  IonModal,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pencilOutline, lockClosedOutline, callOutline, mailOutline, personOutline, calendarOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { ProfileService } from '../../../services/account/profile-service';
import { ProfileInfo } from '../../../models/profile/profile';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-profile-inf',
  templateUrl: './profile-info.page.html',
  styleUrls: ['./profile-info.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonAvatar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonBadge,
    IonSkeletonText,
    IonModal,
  ]
})
export class ProfileInfPage {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private auth = inject(AuthService);
  private router = inject(Router);

  profile = signal<ProfileInfo | null>(null);
  loading = signal<boolean>(true);
  editOpen = signal<boolean>(false);
  passwordOpen = signal<boolean>(false);

  profileForm = this.fb.nonNullable.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone_number: [''],
  });

  passwordForm = this.fb.nonNullable.group({
    current_password: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    addIcons({ pencilOutline, lockClosedOutline, callOutline, mailOutline, personOutline, calendarOutline, checkmarkCircleOutline });
    this.loadProfile();
  }


  async loadProfile() {
    this.loading.set(true);
    try {
      const data = await this.profileService.getProfile();
      this.profile.set(data);
      this.profileForm.patchValue({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
      });
    } finally {
      this.loading.set(false);
    }
  }

  getImageUrl(photo?: string | null): string | null {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    const base = (environment.imageUrl || environment.apiUrl || '').replace(/\/+$/, '');
    const path = photo.startsWith('/') ? photo : `/${photo}`;
    return `${base}${path}`;
  }

  openEditModal() { this.editOpen.set(true); }
  closeEditModal() { this.editOpen.set(false); }
  openPasswordModal() { this.passwordOpen.set(true); }
  closePasswordModal() { this.passwordOpen.set(false); }

  async saveProfile() {
    if (this.profileForm.invalid) return;
    const dto = this.profileForm.getRawValue(); // Get form values
    const updated = await this.profileService.updateProfile(dto);
    this.profile.set(updated);
    this.closeEditModal();
  }

  async savePassword() {
    if (this.passwordForm.invalid) return;
    try {
      await this.profileService.changePassword(this.passwordForm.getRawValue());
      this.closePasswordModal();
      this.passwordForm.reset({ current_password: '', password: '', password_confirmation: '' });
      // Déconnecter l'utilisateur et rediriger vers la page de connexion
      this.auth.logout();
      this.router.navigateByUrl('/login');
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
    }
  }

}
