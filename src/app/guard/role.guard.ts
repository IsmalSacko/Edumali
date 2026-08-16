import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

/**
 * Garde basée sur le rôle réel de l'utilisateur (auth.user() est chargé au
 * démarrage de l'app / après login, pas d'appel réseau supplémentaire ici).
 * Contrairement à l'ancien AdminGuard, ne retombe jamais sur `true` par défaut :
 * seul un rôle présent dans allowedRoles passe.
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return async (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.access) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    // Le signal auth.user() peut ne pas encore être chargé juste après un
    // rechargement de page (loadCurrentUser() en cours) : on interroge le
    // rôle directement plutôt que de risquer un faux négatif sur le signal.
    let role = auth.user()?.role;
    if (!role) {
      try {
        role = (await auth.currentUser())?.role;
      } catch {
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
      }
    }

    if (role && allowedRoles.includes(role)) {
      return true;
    }

    return router.createUrlTree(['/home']);
  };
}
