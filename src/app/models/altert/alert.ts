// Modèle d'alerte aligné sur l'API Django (AlertSerializer)
export interface Alert {
  id?: number;
  name: string; // type d'alerte (ex: absences, notes...)
  description: string;
  active: boolean;
  created_at?: string;
}

// Profil d'établissement (SchoolProfileSerializer)
export interface SchoolProfile {
  id?: number;
  name: string;
  logo?: string;
  cachet?: string;
  directeur: string;
  directeur_name?: string;
  signature_directeur?: string;
}

// Journal des actions (ActionLogSerializer)
export interface ActionLog {
  id?: number;
  user?: number | null;
  user_info?: {
    id?: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  } | null;
  action: string;
  timestamp: string;
  description: string;
}