import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'nav',
    loadComponent: () => import('./shared/nav/nav.page').then( m => m.NavPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/auth/auth.page').then( m => m.AuthPage)
  },
];
