import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth/auth.service";
import { inject } from "@angular/core";

export const authGuard: CanActivateFn =  async (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    
    // Vérifier d'abord s'il y a un token valide
    if (!auth.access) {
        // Pas de token -> rediriger vers login
        return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }
    
    // Vérifier le rôle utilisateur
    try {
        if (await auth.currentUserRole()) {
            return true;
        }
    } catch (err) {
        console.error('Auth guard error:', err);
    }
    
    // Redirection vers /login avec l'URL de retour
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
}
