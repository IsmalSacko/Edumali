import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';


@Component({
  selector: 'app-login-component',
  imports: [
    ReactiveFormsModule, 
    FormsModule, 
    MatButtonModule, 
    MatInputModule , 
    MatFormFieldModule,
    MatIcon, MatCard,
    MatCardTitle,
    MatCardContent,
    
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css',
})
export class LoginComponent {
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    username = '';
    password = '';
    errorMsg = '';
    loading = false;
    hidePassword = true;


  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  async login() {
    this.errorMsg = '';
    this.loading = true;
    try {
      await this.authService.login(this.username, this.password);
      // Valeur par défaut si returnUrl est null
      const raw = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard'; 
      const returnUrl = raw.startsWith('/') ? raw : '/dashboard'; // Garantir que l'URL commence par '/'
      // Navigation vers l'URL d'origine (ou dashboard par défaut) sans recharger la page
      await this.router.navigateByUrl(returnUrl);
     
    } catch (err: any) {
      this.errorMsg = err;
    } finally {
      this.loading = false;
    }
  }
}
