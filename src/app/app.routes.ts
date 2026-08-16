import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { NavPage } from './shared/nav/nav.page';
import { AuthPage } from './pages/auth/auth/auth.page';
import { authGuard } from './guard/auth.guard';
import { roleGuard } from './guard/role.guard';
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
import { AttendancePage } from './pages/attendance/attendance.page';
import { MessagingPage } from './pages/messaging/messaging.page';
import { NotificationsPage } from './pages/notifications/notifications.page';
import { ActionLogsPage } from './pages/action-logs/action-logs.page';
import { PaymentsPage } from './pages/payments/payments.page';
import { SettingsPage } from './pages/settings/settings.page';

const ALL_ROLES = ['admin', 'teacher', 'surveillant', 'comptable', 'parent', 'student'];

export const routes: Routes = [
  { path: 'home', component: HomePage, canActivate: [authGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'nav', component: NavPage },
  { path: 'login', component: AuthPage },
  { path: 'profile', component: ProfileInfPage, canActivate: [authGuard] },
  { path: 'classes', component: ClassePage, canActivate: [authGuard] },
  { path: 'emplois-du-temps', component: EmploisDuTempsPage, canActivate: [authGuard] },
  // Le back autorise admin ET enseignant (IsTeacherOrAdmin) sur les évaluations.
  { path: 'evaluations', component: EvaluationPage, canActivate: [roleGuard(['admin', 'teacher'])] },
  { path: 'bulletin/:studentId/:trimester', component: EvaluationPage, canActivate: [authGuard] },
  { path: 'students', component: StudentListPage, canActivate: [authGuard] },
  { path: 'teachers', component: EnseignantListPage, canActivate: [authGuard] },
  { path: 'stats', component: StatPage, canActivate: [AdminGuard] },
  { path: 'register', component: RegisterPage },
  { path: 'student-register', component: StudentEditPage, canActivate: [AdminGuard] },
  { path: 'student-detail/:id', component: StudentDetailPage, canActivate: [AdminGuard] },
  { path: 'student-profile-edit/:id', component: StudentProfileEditPage, canActivate: [AdminGuard] },
  { path: 'enseignant-detail/:id', component: EnseignantDetailPage, canActivate: [AdminGuard] },
  { path: 'attendance', component: AttendancePage, canActivate: [roleGuard(ALL_ROLES)] },
  { path: 'messages', component: MessagingPage, canActivate: [roleGuard(ALL_ROLES)] },
  { path: 'notifications', component: NotificationsPage, canActivate: [authGuard] },
  { path: 'logs', component: ActionLogsPage, canActivate: [roleGuard(['admin'])] },
  // Réservé admin/comptable côté back (IsAdminOrComptable) : pas d'accès
  // parent/élève tant que le back n'expose pas de lecture pour ces rôles.
  { path: 'payments', component: PaymentsPage, canActivate: [roleGuard(['admin', 'comptable'])] },
  { path: 'settings', component: SettingsPage, canActivate: [roleGuard(['admin'])] },
  // Filet de sécurité : un lien vers une route inexistante ne doit pas rester
  // silencieusement sans effet (cas vécu avec /settings avant son ajout ci-dessus).
  { path: '**', redirectTo: 'home' },
];
