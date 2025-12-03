import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth/auth.service';
import { IonicModule } from "@ionic/angular";

@Component({
  selector: 'app-nabar-component',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  templateUrl: './nabar-component.html',
  styleUrls: ['./nabar-component.css'],
})
export class NabarComponent {
  currentUser: any;
  private authService = inject(AuthService);
  private router = inject(Router);
  private readonly base = environment.imageUrl;

    async ngOnInit(): Promise<void> {
    // Initialisation des données du tableau de bord
    try {
      this.currentUser = await this.authService.currentUser();
      // Si l'utilisateur n'a pas de photo, utiliser le chemin fourni
      if (!this.currentUser?.profile_photo) {
        this.currentUser = this.currentUser || {};
        this.currentUser.profile_photo = '/media/profiles/IMG_2820.PNG';
      }
      // Préfixer les chemins `/media` avec l'origin du backend en dev
      if (this.currentUser?.profile_photo && this.currentUser.profile_photo.startsWith('/media')) {
        this.currentUser.profile_photo = this.base + this.currentUser.profile_photo;
      }
      //await this.loadStats();
      console.log('Current User:', this.currentUser);
    } catch (err) {
      console.warn('Error loading current user', err);
      // If not authorized, redirect to login
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onProfileImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;
    img.src = '/logo-edumali.png';
    img.style.objectFit = 'cover';
  }
}
