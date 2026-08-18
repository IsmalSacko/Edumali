// auth.service.ts
import { inject, Injectable, signal, effect } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Browser } from '@capacitor/browser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // access token en mémoire/localStorage
  private _access: string | null = null;
  private readonly base = environment.apiUrl;
  private readonly loginUrl = `${this.base}/auth/jwt/create/`;
  private route = inject(Router);
  private alertCtrl = inject(AlertController);

  // Signal global pour l'utilisateur courant - accessible par tous les composants
  public user = signal<any | null>(null);
  // Signal pour demander l'affichage du modal d'accès restreint
  public showAdminModal = signal(false);
  private _initialized = false;

  constructor() {
    // localStorage, pas sessionStorage : sur mobile (Capacitor), le process
    // est tué à chaque fermeture d'app — sessionStorage ne survit pas,
    // contrairement à un onglet de navigateur resté ouvert (c'était la
    // cause d'une reconnexion systématique à chaque relance de l'app).
    this._access = localStorage.getItem('access_token');

    if (this._initialized) return;
    this._initialized = true;

    if (this._access) {
      // Access token présent : tente de charger l'utilisateur, et seulement
      // s'il est réellement périmé (échec), retombe sur le refresh token.
      this.loadCurrentUser().catch(() => this.restoreFromRefreshToken());
    } else {
      // Pas d'access token (probable après un redémarrage de l'app, sa
      // durée de vie étant courte) mais peut-être un refresh token encore
      // valide (plus longue durée) : on tente de rebondir dessus avant
      // d'abandonner et de forcer une reconnexion.
      this.restoreFromRefreshToken();
    }
  }

  /** Échange le refresh token stocké contre un nouvel access token, puis
   * recharge l'utilisateur. Efface la session si le refresh échoue
   * (token périmé/révoqué). */
  private async restoreFromRefreshToken() {
    const refresh = this.getRefresh();
    if (!refresh) return;
    try {
      const r = await axios.post(`${this.base}/auth/jwt/refresh/`, { refresh });
      if (r.data?.access) {
        this.access = r.data.access;
        await this.loadCurrentUser();
      }
    } catch (err) {
      console.error('Refresh token invalide, reconnexion nécessaire:', err);
      this.access = null;
      this.removeRefresh();
      this.user.set(null);
    }
  }

  set access(token: string | null) {
    this._access = token;
    if (token) localStorage.setItem('access_token', token);
    else localStorage.removeItem('access_token');
  }

  get access(): string | null {
    return this._access;
  }

  // refresh token + code école en localStorage (survivent à la fermeture
  // de l'app, contrairement à sessionStorage — voir constructor()).
  private refreshKey = 'refresh_token';
  private schoolCodeKey = 'school_code';
  setRefresh(token: string) {
    localStorage.setItem(this.refreshKey, token);
  }
  getRefresh(): string | null {
    return localStorage.getItem(this.refreshKey);
  }
  removeRefresh() { localStorage.removeItem(this.refreshKey); }

  // Charger l'utilisateur courant et mettre à jour le signal
  private async loadCurrentUser() {
    try {
      const userData = await this.currentUser();
      this.user.set(userData);
    } catch (err) {
      console.error('Failed to load current user:', err);
      this.user.set(null);
    }
  }

  // login: returns response data
  // schoolCode identifie l'école (multi-tenant : chaque école a son propre
  // schéma de données). Le backend embarque ensuite le schéma résolu dans le
  // JWT (claim school_schema), donc il n'est plus nécessaire de le renvoyer
  // sur les requêtes suivantes.
  async login(username: string, password: string, schoolCode: string) {
    try {
      const response = await axios.post(this.loginUrl, { username, password, school_code: schoolCode });
      const data = response.data;
      if (data?.access) this.access = data.access;
      if (data?.refresh) this.setRefresh(data.refresh);
      // Mémorisé pour getSchoolAdminUrl() — le code école saisi ici est
      // aussi le sous-domaine de l'école (voir apps/tenancy/signals.py côté
      // back : Domain = slugify(code) + BASE_DOMAIN).
      localStorage.setItem(this.schoolCodeKey, schoolCode);
      console.log('Logged in, access token set.' + (this.access ? '✅' + this.access : '❌'));
      // Charger les infos utilisateur et mettre à jour le signal global
      await this.loadCurrentUser();
      return data;
    } catch (err) {
      throw new Error(this.extractErrorMessage(err));
    }
  }

  // Extrait un message lisible depuis une erreur axios (le backend renvoie
  // des erreurs de validation DRF, ex: {"school_code": ["École introuvable..."]})
  private extractErrorMessage(err: unknown): string {
    const data = (err as any)?.response?.data;
    if (data && typeof data === 'object') {
      const firstValue = Object.values(data)[0];
      if (Array.isArray(firstValue) && firstValue.length) return String(firstValue[0]);
      if (typeof firstValue === 'string') return firstValue;
      if (typeof data.detail === 'string') return data.detail;
    }
    return err instanceof Error ? err.message : 'Connexion impossible';
  }


  // Liste publique des écoles actives, pour le sélecteur d'école au login
  // (GET /api/public/schools/, AllowAny côté back — pas besoin de token).
  async getActiveSchools(): Promise<{ code: string; name: string }[]> {
    try {
      const r = await axios.get(`${this.base}/public/schools/`);
      return (r.data ?? []) as { code: string; name: string }[];
    } catch (err) {
      console.warn('getActiveSchools error', err);
      return [];
    }
  }

  logout() {
    this.access = null;
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.schoolCodeKey);
    // Réinitialiser l'utilisateur global
    this.user.set(null);
  }

  // URL de l'admin Django de l'école de l'utilisateur connecté. Construite à
  // partir du code école (== sous-domaine, voir login() ci-dessus) plutôt
  // que de window.location.origin : sur mobile (Capacitor) l'origine de la
  // webview ne correspond à aucune vraie école. Repli sur adminUrl si le
  // code n'est pas connu (env. locale sans baseDomain, ou session sans login
  // explicite ex. après un reload avant que loadCurrentUser ait resitué
  // le contexte école).
  getSchoolAdminUrl(): string {
    const code = localStorage.getItem(this.schoolCodeKey);
    // Slash final obligatoire : nginx (docker/nginx/default.conf, back) ne
    // route vers Django que sur `^/(admin|platform-admin)/` — sans le
    // slash, la requête tombe dans le fallback SPA Angular et sert
    // index.html au lieu du Django admin.
    return environment.baseDomain && code
      ? `https://${code}.${environment.baseDomain}/admin/`
      : `${environment.adminUrl}/`;
  }

  // Ouvre le Django admin de l'école dans le navigateur. Centralisé ici
  // (au lieu de dupliquer Browser.open() dans chaque composant) pour que
  // l'échec soit visible au lieu de silencieux : sur certains téléphones
  // réels, Browser.open() rejette (pas de navigateur compatible Custom
  // Tabs...) et un rejet non attrapé ne montre rien à l'utilisateur — d'où
  // ce try/catch avec une alerte qui expose l'erreur réelle.
  async openSchoolAdmin(): Promise<void> {
    const url = this.getSchoolAdminUrl();
    try {
      await Browser.open({ url });
    } catch (err) {
      console.error('Browser.open a échoué', url, err);
      const alert = await this.alertCtrl.create({
        header: "Impossible d'ouvrir l'admin",
        message: `${url}\n\n${err instanceof Error ? err.message : String(err)}`,
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

  async currentUserRole() {
    const url = `${this.base}/users/me/`;
    const r = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${this.access}`

      }
    });
    const role = r.data.role;
    console.log('Current User Role:', role);

    if (role !== 'admin') {
      // Haptic feedback (best-effort)
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch (e) {
        // ignore on platforms without Capacitor Haptics
      }

      // Request UI to show the admin-restricted modal (presented by a component)
      this.showAdminModal.set(true);
      // The component presenting the modal will handle redirect after dismiss
      return null;
    }

    // If admin, return the user data
    return r.data.role ? r.data : null;
  }


  async currentUser() {
    const url = `${this.base}/users/me/`;
    const r = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${this.access}`

      }
    });

    return r.data;
  }

  // Retourne le rôle, ou null
  async getUserRole(): Promise<string | null> {
    try {
      const user = await this.currentUser();
      return user?.role ?? null;
    } catch (err) {
      console.warn('getUserRole error', err);
      return null;
    }
  }

  // Indique si l'utilisateur est admin
  async isAdmin(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === 'admin' || role === 'ADMIN' || role === 'Admin';
  }


}
