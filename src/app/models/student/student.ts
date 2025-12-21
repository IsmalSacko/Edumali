import { ProfileInfo } from '../profile/profile';
import { Classe } from '../classe/classes';

export type Gender = 'M' | 'F';
export type Status = 'actif' | 'exclu' | 'transféré';

export interface Student {
    id?: number;
    matricule?: string;
    date_of_birth?: string;
    mois?: number; // 1 à 12
    gender?: Gender;
    status?: Status;
    user: ProfileInfo;
    classe?: Classe;
}