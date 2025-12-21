import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { NavPage } from './shared/nav/nav.page';
import { AuthPage } from './auth/auth/auth.page';
import { authGuard } from './guard/auth.guard';
import { ProfileInfPage } from './account/profile/profile-info/profile-info.page';
import { ClassePage } from './classe/classe/classe.page';
import { EmploisDuTempsPage } from './empplois-du-temps/emplois-du-temps/emplois-du-temps.page';
import { EvaluationPage } from './evaluation/evaluation.page';
import { StudentListPage } from './student/student-list/student-list.page';
import { EnseignantListPage } from './enseignant/enseignant-list/enseignant-list.page';

export const routes: Routes = [
  { path: 'home', component: HomePage },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'nav', component: NavPage },
  { path: 'login', component: AuthPage },
  { path: 'profile', component: ProfileInfPage },
  { path: 'classes', component: ClassePage, canActivate: [] },
  { path: 'emplois-du-temps', component: EmploisDuTempsPage, canActivate: [] },
  { path: 'evaluations', component: EvaluationPage, canActivate: [] },
  { path: 'students', component: StudentListPage },
  { path: 'teachers', component: EnseignantListPage }





];
