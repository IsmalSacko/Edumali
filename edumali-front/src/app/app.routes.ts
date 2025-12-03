import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login-component/login-component';
import { DashboardComponent } from './shared/Dashboard/dashboard-component/dashboard-component';
import { ClasseComponent } from './classes/classe-component/classe-component';
import { EvaluationComponent } from './evaluations/evaluation-component/evaluation-component';

export const routes: Routes = [
     // Route par défaut
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
    // Placeholder routes for sidebar links (replace with real components later)
  { path: 'students', component: DashboardComponent },
  { path: 'teachers', component: DashboardComponent },
  { path: 'classes', component: ClasseComponent },
  { path: 'timetable', component: DashboardComponent },
  { path: 'evaluations', component: EvaluationComponent },
  { path: 'stats', component: DashboardComponent },
  { path: 'settings', component: DashboardComponent },
  { path: 'login', component: LoginComponent }
];
