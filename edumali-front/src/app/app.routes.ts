import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login-component/login-component';
import { DashboardComponent } from './shared/Dashboard/dashboard-component/dashboard-component';

export const routes: Routes = [
     // Route par défaut
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
    // Placeholder routes for sidebar links (replace with real components later)
  { path: 'students', component: DashboardComponent },
  { path: 'teachers', component: DashboardComponent },
  { path: 'classes', component: DashboardComponent },
  { path: 'timetable', component: DashboardComponent },
  { path: 'evaluations', component: DashboardComponent },
  { path: 'stats', component: DashboardComponent },
  { path: 'settings', component: DashboardComponent },
  { path: 'login', component: LoginComponent }
];
