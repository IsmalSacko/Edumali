export type Cycle = 'primaire' | 'secondaire' | 'lycee';

export interface Matiere {
  id: number;
  nom: string;
  description?: string | null;
  cycle: Cycle;
  coefficient?: number;
}

export interface Classe {
  id: number;
  nom: string;
  annee: number; // 1..12
  enseignants?: { id: number; first_name?: string; last_name?: string }[];
  matieres?: Matiere[];
  eleves?: { id: number; username?: string; first_name?: string; last_name?: string }[];
}

export interface EmploiDuTempsItem {
  id: number;
  classe: { id: number; nom: string };
  matiere: { id: number; nom: string };
  enseignant?: { id: number; first_name?: string; last_name?: string } | null;
  jour_semaine: number; // 1 = Lundi .. 6 = Samedi
  heure_debut: string; // 'HH:MM:SS' or 'HH:MM'
  heure_fin: string;
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
