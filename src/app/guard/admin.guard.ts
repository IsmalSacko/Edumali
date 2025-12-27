import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth/auth.service";
import { inject } from "@angular/core";

export const AdminGuard: CanActivateFn = async (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // Si pas de token, rediriger vers /login
    if (!auth.access) {
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    // L'utilisateur est authentifié — autoriser l'accès.
    // La logique spécifique de rôle (admin vs user) doit être gérée
    // Vérifier le rôle utilisateur
    try {
        if (await auth.currentUserRole()) {
            return true;
        }
    } catch (err) {
        console.error('Auth guard error:', err);
    }
    // par un guard distinct ou côté composant/service si nécessaire.
    return true;
};
