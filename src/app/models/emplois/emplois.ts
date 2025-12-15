import { Matiere, Enseignant } from '../classe/classes';

export interface EmploiDuTempsItem {
	id ?: number;
	matiere?: Matiere;
	enseignant?: Enseignant;
	jour_semaine?: number;
	jour_semaine_display?: string;
	heure_debut?: string; // format HH:MM:SS
	heure_fin?: string;   // format HH:MM:SS
}

export type EmploiDuTemps = EmploiDuTempsItem[];

// Labels par jour pour aide frontend
export const JOUR_SEMAINE_LABELS: Record<number, string> = {
	1: 'Lundi',
	2: 'Mardi',
	3: 'Mercredi',
	4: 'Jeudi',
	5: 'Vendredi',
	6: 'Samedi',
};

// Regroupe les items par jour de semaine
export function groupEmploisByDay(items: EmploiDuTempsItem[]): Record<number, EmploiDuTempsItem[]> {
	return items.reduce((acc: Record<number, EmploiDuTempsItem[]>, it) => {
		const d = Number(it.jour_semaine) || 0;
		if (!acc[d]) acc[d] = [];
		acc[d].push(it);
		return acc;
	}, {});
}

// Trie les items d'une journée par heure de début
export function sortDayItems(items: EmploiDuTempsItem[]): EmploiDuTempsItem[] {
	return items.slice().sort((a, b) => (a.heure_debut || '').localeCompare(b.heure_debut || ''));
}
