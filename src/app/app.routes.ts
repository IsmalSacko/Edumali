import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { NavPage } from './shared/nav/nav.page';
import { AuthPage } from './pages/auth/auth/auth.page';
import { authGuard } from './guard/auth.guard';
import { ProfileInfPage } from './pages/account/profile/profile-info/profile-info.page';
import { ClassePage } from './pages/classe/classe/classe.page';
import { EmploisDuTempsPage } from './pages/empplois-du-temps/emplois-du-temps/emplois-du-temps.page';
import { EvaluationPage } from './pages/evaluation/evaluation.page';
import { StudentListPage } from './pages/student/student-list/student-list.page';
import { EnseignantListPage } from './pages/enseignant/enseignant-list/enseignant-list.page';
import { StatPage } from './pages/stats/stat/stat.page';

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
  { path: 'teachers', component: EnseignantListPage },
  {
    path: 'stats', component: StatPage, canActivate: []
  }






];
