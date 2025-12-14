import { Routes } from '@angular/router';
import { HomePage } from './home/home.page';
import { NavPage } from './shared/nav/nav.page';
import { AuthPage } from './auth/auth/auth.page';
import { authGuard } from './guard/auth.guard';
import { ProfileInfPage } from './account/profile/profile-info/profile-info.page';
import { ClassePage } from './classe/classe/classe.page';

export const routes: Routes = [
  {path: 'home', component: HomePage },
  {path: '',redirectTo: 'home',pathMatch: 'full'},
  {path: 'nav',component: NavPage},
  {path: 'login', component: AuthPage},
  {path: 'profile', component: ProfileInfPage, canActivate: [authGuard]},
  {
    path: 'classes', component: ClassePage, canActivate: [authGuard]},
 
];
