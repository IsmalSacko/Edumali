import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { NavPage } from './shared/nav/nav.page';
import { AuthPage } from './pages/auth/auth/auth.page';
import { authGuard } from './guard/auth.guard';
import { ProfileInfPage } from './pages/account/profile/profile-info/profile-info.page';
import { ClassePage } from './pages/classe/classe/classe.page';
import { EmploisDuTempsPage } from './pages/empplois-du-temps/emplois-du-temps/emplois-du-temps.page';
import { EvaluationPage } from './pages/evaluation/evaluation.page';
import { StudentListPage } from './pages/student/student-list/list/student-list.page';
import { EnseignantListPage } from './pages/enseignant/enseignant-list/enseignant-list.page';
import { StatPage } from './pages/stats/stat/stat.page';
import { RegisterPage } from './pages/student/register/register.page';
import { AdminGuard } from './guard/admin.guard';
import { StudentEditPage } from './pages/student/student-edit/student-edit.page';
import { StudentDetailPage } from './pages/student/detail/student-detail.page';
import { StudentProfileEditPage } from './pages/student/student-profile-edit/student-profile-edit.page';
import { EnseignantDetailPage } from './pages/enseignant/enseignant-detail/enseignant-detail.page';

export const routes: Routes = [
  { path: 'home', component: HomePage },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'nav', component: NavPage },
  { path: 'login', component: AuthPage },
  { path: 'profile', component: ProfileInfPage, canActivate: [authGuard] },
  { path: 'classes', component: ClassePage, canActivate: [authGuard] },
  { path: 'emplois-du-temps', component: EmploisDuTempsPage, canActivate: [] },
  { path: 'evaluations', component: EvaluationPage, canActivate: [AdminGuard] },
  { path: 'students', component: StudentListPage, canActivate: [authGuard] },
  { path: 'teachers', component: EnseignantListPage, canActivate: [authGuard] },
  { path: 'stats', component: StatPage, canActivate: [AdminGuard] },
  { path: 'register', component: RegisterPage },
  { path: 'student-register', component: StudentEditPage, canActivate: [AdminGuard] },
  { path: 'student-detail/:id', component: StudentDetailPage, canActivate: [AdminGuard] },
  { path: 'student-profile-edit/:id', component: StudentProfileEditPage, canActivate: [AdminGuard] },
  { path: 'enseignant-detail/:id', component: EnseignantDetailPage, canActivate: [AdminGuard] }











];
