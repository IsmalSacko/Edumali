// Utilisé pour le build Capacitor (npm run build:mobile). La webview
// mobile est chargée en local (origin = https://localhost, capacitor://...
// selon la plateforme) — contrairement au web, `window.location.origin`
// (voir environment.prod.ts) ne pointe donc jamais vers une vraie école.
// Il faut une URL d'API fixe.
//
// IMPORTANT : ce sous-domaine ne doit pas être "admin.<domaine>". Ce dernier
// est spécial côté back (voir apps/tenancy/middleware.py,
// _schema_from_hostname) : il bascule directement sur le tenant plateforme
// et court-circuite la résolution par school_code envoyée au login, ce qui
// casserait la connexion pour toutes les écoles.
const BASE_DOMAIN = 'scolmali.ismaeldev.fr';
const API_BASE = `https://api.${BASE_DOMAIN}`;

export const environment = {
  production: true,
  apiUrl: `${API_BASE}/api`,
  imageUrl: `${API_BASE}/`,
  adminUrl: `${API_BASE}/admin`,
  baseDomain: BASE_DOMAIN,
};
