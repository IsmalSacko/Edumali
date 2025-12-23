import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import {
  IonContent,
  IonButtons,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonIcon,
  IonNote,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline, logInOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    IonContent,
    // IonHeader,
    // IonToolbar,
    IonButtons,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonInput,
    IonItem,
    IonLabel,
    IonIcon,
    IonNote,
    IonSpinner,
  ]
})
export class AuthPage implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  hidePassword = signal<boolean>(true);
  loading = signal<boolean>(false);
  errorMsg = signal<string>('');

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, logInOutline, shieldCheckmarkOutline });
  }

  async ngOnInit() {
    // Attendre que l'utilisateur soit chargé si un token existe
    // Attendre un peu pour que le signal soit mis à jour
    await new Promise(resolve => setTimeout(resolve, 100));

    // Si l'utilisateur est déjà connecté, rediriger vers l'URL de retour ou l'accueil
    if (this.auth.user()) {
      const raw = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
      const returnUrl = raw.startsWith('/') ? raw : '/home';
      this.router.navigateByUrl(returnUrl);
    }
  }

  togglePasswordVisibility() {
    this.hidePassword.update((v) => !v);
  }

  async submit() {
    this.errorMsg.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { username, password } = this.form.getRawValue();
    try {
      await this.auth.login(username, password);
      const raw = this.route.snapshot.queryParamMap.get('returnUrl') || '/home';
      const returnUrl = raw.startsWith('/') ? raw : '/home';
      await this.router.navigateByUrl(returnUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connexion impossible';
      this.errorMsg.set(message);
    } finally {
      this.loading.set(false);
    }
  }

}
