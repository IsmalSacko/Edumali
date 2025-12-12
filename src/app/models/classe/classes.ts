export type Cycle = 'primaire' | 'secondaire' | 'lycee';

export interface Matiere {
  id: number;
  nom: string;
  description?: string;
  cycle: Cycle;
  cycle_display: string;
  coefficient?: number;
}

export interface Enseignant {
  id: number;
  full_name: string;
  specialty?: string | null;
}

export interface Eleve {
  id: number;
  full_name: string;
  matricule: string;
}

export interface EmploiDuTempsItem {
  id: number;
  matiere: Matiere;
  enseignant: Enseignant;
  jour_semaine: number;
  jour_semaine_display: string;
  heure_debut: string;
  heure_fin: string;
}

export interface ClasseListe {
  id: number;
  nom: string;
  annee: number;
  annee_display: string;
  nombre_eleves: number;
  nombre_matieres: number;
}

export interface Classe {
  id: number;
  nom: string;
  annee: number;
  annee_display: string;
  matieres: Matiere[];
  enseignants: Enseignant[];
  eleves: Eleve[];
  emplois_du_temps: EmploiDuTempsItem[];
  nombre_eleves: number;
  nombre_matieres: number;
  nombre_enseignants: number;
}

/** Helpers utiles côté frontend */
export const JOUR_SEMAINE_LABELS: Record<number, string> = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
};

/** Grouper une liste d'emplois par jour de semaine (1..6) */
export function groupEmploisByDay(items: EmploiDuTempsItem[]): Record<number, EmploiDuTempsItem[]> {
  return items.reduce((acc: Record<number, EmploiDuTempsItem[]>, it) => {
    const d = Number(it.jour_semaine) || 0;
    if (!acc[d]) acc[d] = [];
    acc[d].push(it);
    return acc;
  }, {});
}

/** Tri par heure_debut pour une journée */
export function sortDayItems(items: EmploiDuTempsItem[]): EmploiDuTempsItem[] {
  return items.slice().sort((a, b) => (a.heure_debut.localeCompare(b.heure_debut)));
}

// Pas d'export par défaut — exportez les types et helpers nommés ci-dessus.
