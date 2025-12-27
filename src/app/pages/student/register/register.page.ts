import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonButton, IonInput, IonText, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { RegisterData, RegisterService, ROLE_CHOICES } from 'src/app/services/register/register';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { lockClosedOutline, mailOutline, personAddOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonIcon,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton,
    ReactiveFormsModule,
    IonText
  ]
})
export class RegisterPage {
  registerData = signal<RegisterData | null>(null);
  private registerService = inject(RegisterService);
  private fb = inject(FormBuilder);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  form: any;
  readonly roleChoices = ROLE_CHOICES;

  constructor() {
    addIcons({ personAddOutline, mailOutline, lockClosedOutline });
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirm: ['', [Validators.required]],
      role: ['teacher', [Validators.required]]
    });


  }

  async onSubmit() {
    this.form.markAllAsTouched();
    // Bloquer l'envoi si l'utilisateur sélectionne le rôle 'admin'
    const selectedRole = this.form.get('role')?.value;
    if (selectedRole === 'admin') {
      this.form.get('role')?.setErrors({ forbiddenRole: true });
      return;
    }

    if (this.form.valid) {
      this.registerData.set(this.form.value);
      const data = this.registerData();
      if (data && data.password === data.passwordConfirm) {
        try {
          const r = await this.registerService.register(data);
          console.log('Registered user:', r);
          const toast = await this.toastCtrl.create({
            message: 'Inscription réussie. Redirection en cours...',
            duration: 2000,
            color: 'success',
            position: 'top'
          });
          await toast.present();
          await toast.onDidDismiss();
          await this.router.navigateByUrl('/profile');
        } catch (err: any) {
          console.error('Erreur lors de l\'inscription:', err);
          const toast = await this.toastCtrl.create({
            message: err?.message || 'Erreur lors de l\'inscription',
            duration: 3000,
            color: 'danger',
            position: 'top'
          });
          await toast.present();
        }
      } else {
        console.error('Les mots de passe ne correspondent pas.');
        const toast = await this.toastCtrl.create({
          message: 'Les mots de passe ne correspondent pas.',
          duration: 2500,
          color: 'danger',
          position: 'top'
        });
        await toast.present();
      }


    }
  }

}
