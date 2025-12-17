import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { Evaluation, MatiereFinalNote, Bulletin } from '../../models/student-info/model';
import { ToastController } from '@ionic/angular/standalone';

export interface EvaluationFilter {
  student?: number;
  classe?: number;
  matiere?: number;
  trimester?: number;
  page?: number;
  page_size?: number;
}

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private api = inject(ApiService);
  private toast = inject(ToastController);
  private readonly base = environment.apiUrl;
  private readonly baseUrl = `${this.base}/grades/evaluations/`;

  // Signals pour gestion réactive
  evaluations = signal<Evaluation[]>([]);
  currentEvaluation = signal<Evaluation | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  totalCount = signal<number>(0);

  /**
   * Récupère toutes les évaluations avec pagination
   * Le backend retourne les données avec student_info, matiere_info, etc.
   */
  async getAll(params?: EvaluationFilter): Promise<Evaluation[]> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const r = await this.api.get<any>(this.baseUrl, { params });
      const items = r.data?.results ?? r.data ?? [];

      this.evaluations.set(items as Evaluation[]);
      this.totalCount.set(r.data?.count ?? items.length);

      console.log('✅ Evaluations chargées:', items.length);
      return items as Evaluation[];
    } catch (e: any) {
      const errorMsg = e?.message ?? 'Erreur lors du chargement des évaluations';
      this.error.set(errorMsg);
      console.error('❌ Error fetching evaluations', e);
      await this.showErrorToast(errorMsg);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Récupère une évaluation par ID
   */
  async getById(id: number): Promise<Evaluation | null> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const r = await this.api.get<any>(`${this.baseUrl}${id}/`);
      const evaluation = r.data as Evaluation;

      this.currentEvaluation.set(evaluation);

      console.log('✅ Evaluation récupérée:', evaluation);
      return evaluation;
    } catch (e: any) {
      const errorMsg = `Évaluation introuvable (ID: ${id})`;
      this.error.set(errorMsg);
      console.error('❌ Error fetching evaluation', e);
      await this.showErrorToast(errorMsg);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Récupère les évaluations d'un élève
   */
  async getByStudent(studentId: number, params?: EvaluationFilter): Promise<Evaluation[]> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const p = { ...(params || {}), student: studentId };
      const r = await this.api.get<any>(this.baseUrl, { params: p });
      const items = (r.data?.results ?? r.data ?? []) as Evaluation[];

      this.evaluations.set(items);
      this.totalCount.set(r.data?.count ?? items.length);

      console.log(`✅ Évaluations de l'élève ${studentId}:`, items.length);
      return items;
    } catch (e: any) {
      const errorMsg = `Impossible de charger les évaluations de l'élève`;
      this.error.set(errorMsg);
      console.error('❌ Error fetching evaluations for student', e);
      await this.showErrorToast(errorMsg);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Récupère les évaluations d'une classe
   */
  async getByClasse(classeId: number, params?: EvaluationFilter): Promise<Evaluation[]> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const p = { ...(params || {}), classe: classeId };
      const r = await this.api.get<any>(this.baseUrl, { params: p });
      const items = (r.data?.results ?? r.data ?? []) as Evaluation[];

      this.evaluations.set(items);
      this.totalCount.set(r.data?.count ?? items.length);

      console.log(`✅ Évaluations de la classe ${classeId}:`, items.length);
      return items;
    } catch (e: any) {
      const errorMsg = `Impossible de charger les évaluations de la classe`;
      this.error.set(errorMsg);
      console.error('❌ Error fetching evaluations for classe', e);
      await this.showErrorToast(errorMsg);
      return [];
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Récupère la note finale normalisée (/20) pour une matière
   * Endpoint: GET /evaluations/{id}/matiere-final-note/
   */
  async getMatiereFinalNote(evalId: number): Promise<MatiereFinalNote | null> {
    this.error.set(null);

    try {
      const r = await this.api.get<any>(`${this.baseUrl}${evalId}/matiere-final-note/`);
      const result = (r.data ?? null) as MatiereFinalNote | null;

      console.log('✅ Note finale récupérée:', result);
      return result;
    } catch (e: any) {
      const errorMsg = `Impossible de récupérer la note finale`;
      this.error.set(errorMsg);
      console.error('❌ Error fetching matiere final note', e);
      await this.showErrorToast(errorMsg);
      return null;
    }
  }

  /**
   * Récupère le bulletin d'un élève pour un trimestre
   * Endpoint: GET /evaluations/bulletin/{student_id}/{trimester}/
   * Retourne un objet Bulletin complet avec moyennes, notes par matière, commentaires
   */
  async getBulletin(studentId: number, trimester: number): Promise<Bulletin | null> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const url = `${this.baseUrl}bulletin/${encodeURIComponent(String(studentId))}/${encodeURIComponent(String(trimester))}/`;
      const r = await this.api.get<any>(url);
      const data = r.data ?? null;
      if (!data) return null;

      // Backend renvoie { student_id, trimester, details: [], total_coeffs, moyenne_generale }
      const grades = Array.isArray(data.details)
        ? data.details.map((d: any) => {
          const hasNumericNote = typeof d.note === 'number' && !Number.isNaN(d.note);
          const avg = hasNumericNote ? Number(d.note) : 0;
          return {
            matiere_id: d.matiere_id,
            matiere_name: d.matiere_nom,
            average: avg,
            count: hasNumericNote ? 1 : 0,
            coefficient: d.coefficient ?? 1,
            noteLabel: hasNumericNote ? `${avg.toFixed(1)}/20` : (d.note || 'Pas d’évaluation'),
          };
        })
        : [];

      const bulletin: Bulletin = {
        student_id: data.student_id,
        student_name: data.student_name ?? '',
        trimester: data.trimester,
        average: data.moyenne_generale ?? data.average ?? 0,
        total_coeffs: data.total_coeffs ?? data.totalCoeffs ?? undefined,
        comments: data.commentaires ?? data.comments ?? null,
        student_photo: data.student_photo ?? data.student_photo ?? undefined,
        grades,
      };



      console.log(`✅ Bulletin reçu pour élève ${studentId} - Trimestre ${trimester}:`, bulletin);
      return bulletin;
    } catch (e: any) {
      const errorMsg = `Bulletin non disponible pour ce trimestre`;
      this.error.set(errorMsg);
      console.error('❌ Error fetching bulletin', e);
      await this.showErrorToast(errorMsg);
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Affiche un toast d'erreur
   */
  private async showErrorToast(message: string): Promise<void> {
    const t = await this.toast.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          text: 'Fermer',
          role: 'cancel',
        },
      ],
    });
    await t.present();
  }

  /**
   * Récupère la photo de profil d'un utilisateur/étudiant par son ID


  /**
   * Affiche un toast de succès
   */
  async showSuccessToast(message: string): Promise<void> {
    const t = await this.toast.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await t.present();
  }
}
