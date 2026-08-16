import { Alert, SchoolProfile, ActionLog } from "src/app/models/altert/alert";
import { environment } from "src/environments/environment";
import { DashboardStats } from "src/app/models/dashboard/dashboard";

export function mapStats(d: any): DashboardStats {
    return {
        totalStudents: d.total_students ?? 0,
        totalTeachers: d.total_teachers ?? 0,
        totalParents: d.total_parents ?? 0,
        totalClasses: d.total_classes ?? 0,
        totalMatieres: d.total_matieres ?? 0,
        averageGlobal: d.moyenne_generale ?? 0,
        studentsByCycle: {
            primaire: d.students_by_cycle?.primaire ?? 0,
            secondaire: d.students_by_cycle?.secondaire ?? 0,
            lycee: d.students_by_cycle?.lycee ?? 0,
        },
        evaluationsByTrimester: d.evaluations_by_trimester ?? undefined,
    };

}

export function mapAlert(d: any): Alert {
    return {
        id: d.id,
        name: d.name ?? '',
        description: d.description ?? '',
        active: Boolean(d.active),
        created_at: d.created_at,
        is_read: Boolean(d.is_read),
        read_at: d.read_at ?? null,
        is_global: Boolean(d.is_global),
    };
}

// Construit l'URL complète d'un média si le back renvoie un chemin relatif.
// imageUrl (pas apiUrl, qui se termine par /api) : les médias sont servis à la racine.
function mediaUrl(path?: string | null): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `${environment.imageUrl}${path.replace(/^\//, '')}`;
}

export function mapSchoolProfile(d: any): SchoolProfile {
    if (!d) return { name: '', directeur: '' } as SchoolProfile;

    // Récupérer le nom du directeur depuis directeur_name retourné par l'API
    const directeurName = d.directeur_name || '';

    return {
        id: d.id,
        name: d.name ?? '',
        logo: mediaUrl(d.logo),
        cachet: mediaUrl(d.cachet),
        directeur: directeurName,
        signature_directeur: mediaUrl(d.signature_directeur),
    };
}

export function mapActionLog(d: any): ActionLog {
    return {
        id: d.id,
        user: d.user ?? null,
        user_info: d.user_info ?? null,
        action: d.action ?? d.name ?? '',  // Accepte 'action' OU 'name' (pour les alerts)
        timestamp: d.timestamp ?? d.created_at ?? '',  // Accepte 'timestamp' OU 'created_at'
        description: d.description ?? '',
    };
}