import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
  schools = signal<{ code: string; name: string }[]>([]);
  schoolsLoading = signal<boolean>(true);
  schoolQuery = signal<string>('');
  showSchoolList = signal<boolean>(false);

  filteredSchools = computed(() => {
    const q = this.schoolQuery().trim().toLowerCase();
    const list = this.schools();
    if (!q) return list;
    return list.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    );
  });

  form = this.fb.nonNullable.group({
    school: ['', [Validators.required]],
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  constructor() {
    addIcons({ eyeOutline, eyeOffOutline, logInOutline, shieldCheckmarkOutline });
  }

  async ngOnInit() {
    this.loadSchools();

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

  /** Charge la liste des écoles actives pour le sélecteur ; en cas d'échec
   * (réseau, endpoint indisponible), la liste reste vide et le template
   * bascule sur un champ texte libre pour saisir le code établissement. */
  async loadSchools() {
    this.schoolsLoading.set(true);
    this.schools.set(await this.auth.getActiveSchools());
    this.schoolsLoading.set(false);
  }

  togglePasswordVisibility() {
    this.hidePassword.update((v) => !v);
  }

  onSchoolSearch(ev: CustomEvent) {
    const value = (ev.detail?.value ?? '') as string;
    this.schoolQuery.set(value);
    this.showSchoolList.set(true);
    // Tant qu'aucune option n'est re-choisie dans la liste, le code
    // sélectionné précédemment n'est plus valide (l'utilisateur retape).
    this.form.controls.school.setValue('');
  }

  onSchoolFocus() {
    this.showSchoolList.set(true);
  }

  onSchoolBlur() {
    // Délai pour laisser le (mousedown) de selectSchool() s'exécuter avant
    // que la liste ne se referme (blur arrive avant click sinon).
    setTimeout(() => this.showSchoolList.set(false), 150);
  }

  selectSchool(s: { code: string; name: string }) {
    this.form.controls.school.setValue(s.code);
    this.schoolQuery.set(s.name);
    this.showSchoolList.set(false);
    // Pré-remplissage pratique : convention observée où le compte admin
    // d'une école a pour identifiant le code école en minuscules. Reste
    // entièrement modifiable, et ne touche jamais un champ déjà rempli.
    if (!this.form.controls.username.value) {
      this.form.controls.username.setValue(s.code.toLowerCase());
    }
  }

  async submit() {
    this.errorMsg.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { school, username, password } = this.form.getRawValue();
    try {
      await this.auth.login(username, password, school);
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
