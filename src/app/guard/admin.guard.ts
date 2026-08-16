import { CanActivateFn } from '@angular/router';
import { roleGuard } from './role.guard';

/** Alias de compatibilité : équivaut à roleGuard(['admin']). */
export const AdminGuard: CanActivateFn = (route, state) => roleGuard(['admin'])(route, state);
