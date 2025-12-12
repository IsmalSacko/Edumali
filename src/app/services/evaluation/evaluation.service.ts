import { Injectable } from '@angular/core';
import { inject } from '@angular/core/primitives/di';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';
import { Evaluation } from '../../models/student-info/model';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private api = inject(ApiService);
  private readonly base = environment.apiUrl;
  private readonly baseUrl = `${this.base}/grades/evaluations/`;

  async getAll(params?: any): Promise<Evaluation[]> {
    try {
      const r = await this.api.get<any>(this.baseUrl, { params });
      const items = r.data?.results ?? r.data ?? [];
      console.log('Fetched evaluations:', items);
      return items as Evaluation[];
    } catch (e) {
      console.warn('Error fetching evaluations', e);
      return [];
    }
  }

  async getById(id: number): Promise<Evaluation | null> {
    try {
      const r = await this.api.get<any>(`${this.baseUrl}${id}/`);
      return r.data as Evaluation;
    } catch (e) {
      console.warn('Error fetching evaluation', e);
      return null;
    }
  }

  async getByStudent(studentId: number, params?: any): Promise<Evaluation[]> {
    try {
      const p = { ...(params || {}), student: studentId };
      const r = await this.api.get<any>(this.baseUrl, { params: p });
      return (r.data?.results ?? r.data ?? []) as Evaluation[];
    } catch (e) {
      console.warn('Error fetching evaluations for student', e);
      return [];
    }
  }

  async getByClasse(classeId: number, params?: any): Promise<Evaluation[]> {
    try {
      const p = { ...(params || {}), classe: classeId };
      const r = await this.api.get<any>(this.baseUrl, { params: p });
      return (r.data?.results ?? r.data ?? []) as Evaluation[];
    } catch (e) {
      console.warn('Error fetching evaluations for classe', e);
      return [];
    }
  }

  /** Appelle l'action custom `matiere-final-note` définie dans le ViewSet backend */
  async getMatiereFinalNote(evalId: number): Promise<{ student_id: number; matiere_id: number; trimester: number; note_finale: number } | null> {
    try {
      const r = await this.api.get<any>(`${this.baseUrl}${evalId}/matiere-final-note/`);
      return r.data ?? null;
    } catch (e) {
      console.warn('Error fetching matiere final note', e);
      return null;
    }
  }

  /** Appelle l'action `bulletin/{student_id}/{trimester}` pour obtenir le bulletin d'un élève */
  async getBulletin(studentId: number, trimester: number): Promise<any | null> {
    try {
      const url = `${this.baseUrl}bulletin/${encodeURIComponent(String(studentId))}/${encodeURIComponent(String(trimester))}/`;
      const r = await this.api.get<any>(url);
      return r.data ?? null;
    } catch (e) {
      console.warn('Error fetching bulletin', e);
      return null;
    }
  }
}
