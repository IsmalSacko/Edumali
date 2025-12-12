import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth/auth.service";
import { inject } from "@angular/core";

export const authGuard: CanActivateFn =  async (route, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (await auth.currentUserRole()) {
        return true;
    } 
    
    // Redirection vres /login avec l'URL de retour
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
}