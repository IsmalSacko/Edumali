export interface StudentsByCycle {
    primaire: number;
    secondaire: number;
    lycee: number;
}

export interface DashboardStats {
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    totalClasses: number;
    totalMatieres: number;
    averageGlobal: number;
    studentsByCycle: StudentsByCycle;
    evaluationsByTrimester?: Record<string, number>;
}

export interface EmploisDuTempsStats {
    classe: string;
}

export interface EmploiDuTempsItem {
    id: number;
    classe: {
        id: number;
        nom: string;
    };
    matiere: {
        id: number;
        nom: string;
    };
    enseignant?: {
        id: number;
        nom?: string;
        first_name?: string;
        last_name?: string;
    } | null;
    jour_semaine: number; // 1=Lundi .. 6=Samedi
    heure_debut: string; // format 'HH:MM:SS' ou 'HH:MM'
    heure_fin: string;
}