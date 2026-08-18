// Django sert le build Angular sur le même sous-domaine que l'API, un par
// école (ecole.scolmali.ismaeldev.fr) — donc pas de domaine fixe possible ici :
// on prend l'origine réelle de la page (protocole + host courants), qui
// pointe automatiquement vers la bonne école pour n'importe quel sous-domaine,
// présent ou futur, sans rebuild.
const origin = window.location.origin;

export const environment = {
  production: true,
  apiUrl: `${origin}/api`,
  imageUrl: `${origin}/`,
  adminUrl: `${origin}/admin`,
  // Le sous-domaine courant EST déjà celui de la bonne école ici (origin
  // dynamique ci-dessus) — présent surtout pour que le mobile
  // (environment.mobile.ts, où origin ne veut rien dire) partage la même
  // forme d'environnement.
  baseDomain: 'scolmali.ismaeldev.fr' as string | null,
};
