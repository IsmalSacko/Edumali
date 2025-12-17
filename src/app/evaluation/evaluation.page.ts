import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonProgressBar,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonLabel,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  statsChartOutline,
  trendingUpOutline,
  bookOutline,
  personOutline,
  refreshOutline,
  filterOutline,
  closeOutline,
  close,
  list,
  documentTextOutline,
  peopleOutline
} from 'ionicons/icons';
import { EvaluationService } from '../services/evaluation/evaluation.service';
import { AuthService } from '../services/auth/auth.service';
import { Evaluation, Bulletin } from '../models/student-info/model';

type ViewMode = 'list' | 'bulletin' | 'stats';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  templateUrl: './evaluation.page.html',
  styleUrls: ['./evaluation.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonSegment,
    IonSegmentButton,
    IonProgressBar,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonLabel,
    IonSearchbar,
  ],
})
export class EvaluationPage implements OnInit {
  private evaluationService = inject(EvaluationService);
  private auth = inject(AuthService);

  // États
  viewMode = signal<ViewMode>('list');
  selectedStudentId = signal<number | null>(null);
  selectedStudentName = signal<string>('');
  selectedTrimester = signal<number>(1);
  searchText = signal<string>('');
  loading = signal<boolean>(false);
  showFilters = signal<boolean>(false);

  // Données du service
  evaluations = computed(() => this.evaluationService.evaluations());
  serviceLoading = computed(() => this.evaluationService.loading());
  serviceError = computed(() => this.evaluationService.error());
  bulletin = signal<Bulletin | null>(null);

  constructor() {
    addIcons({
      statsChartOutline,
      list,
      documentTextOutline,
      trendingUpOutline,
      filterOutline,
      closeOutline,
      close,
      refreshOutline,
      personOutline,
      bookOutline,
      peopleOutline
    });
  }

  ngOnInit() {
    this.loadEvaluations();
  }
  // Filtrées par recherche
  filteredEvaluations = computed(() => {
    const all = this.evaluations();
    const search = this.searchText().toLowerCase();

    if (!search) return all;

    return all.filter((e) => {
      // Utiliser student_info en priorité (données du backend)
      const studentName = e.student_info
        ? `${e.student_info.prenom || ''} ${e.student_info.nom || ''}`.toLowerCase()
        : typeof e.student !== 'number' && e.student
          ? `${e.student.first_name || ''} ${e.student.last_name || ''}`.toLowerCase()
          : '';

      // Utiliser matiere_info en priorité
      const matiereName = e.matiere_info
        ? e.matiere_info.nom.toLowerCase()
        : typeof e.matiere !== 'number' && e.matiere
          ? e.matiere.nom.toLowerCase()
          : '';

      return studentName.includes(search) || matiereName.includes(search);
    });
  });

  // Statistiques
  averageScore = computed(() => {
    const evals = this.filteredEvaluations();
    if (evals.length === 0) return 0;

    const sum = evals.reduce((acc, e) => {
      return acc + (e.normalized_note ?? (e.score / e.max_score) * 20);
    }, 0);

    return +(sum / evals.length).toFixed(2);
  });

  // Grouper les notes par élève
  evaluationsByStudent = computed(() => {
    const evals = this.filteredEvaluations();
    const grouped = new Map<number, Evaluation[]>();

    evals.forEach((e) => {
      const studentKey = this.getStudentId(e) ?? e.student_info?.id ?? -1;
      if (!grouped.has(studentKey)) grouped.set(studentKey, []);
      grouped.get(studentKey)!.push(e);
    });

    return Array.from(grouped.entries()).map(([studentId, items]) => {
      const firstItem = items[0];
      let studentName = 'Inconnu';
      let studentPhoto: string | undefined = undefined;

      if (firstItem.student_info) {
        studentName = `${firstItem.student_info.prenom || ''} ${firstItem.student_info.nom || ''}`.trim();
        studentPhoto = firstItem.student_info.student_photo || undefined;
      } else if (typeof firstItem.student !== 'number' && firstItem.student) {
        studentName = `${firstItem.student.first_name || ''} ${firstItem.student.last_name || ''}`.trim();
      }

      const average = items.reduce((acc, e) => {
        return acc + (e.normalized_note ?? (e.score / e.max_score) * 20);
      }, 0) / items.length;

      return {
        studentId,
        studentName,
        studentPhoto: firstItem.student_info?.student_photo || undefined,
        evaluations: items,
        average: average.toFixed(2),
      };
    });
  });

  // Grouper les notes par matière
  evaluationsByMatiere = computed(() => {
    const evals = this.filteredEvaluations();
    const grouped = new Map<number | string, Evaluation[]>();

    evals.forEach((e) => {
      const matiereKey = this.getMatiereId(e) ?? e.matiere_info?.id ?? `matiere-${e.id}`;
      if (!grouped.has(matiereKey)) grouped.set(matiereKey, []);
      grouped.get(matiereKey)!.push(e);
    });

    return Array.from(grouped.entries()).map(([matiereId, items]) => {
      const firstItem = items[0];
      let matiereName = 'Inconnu';
      let coefficient = 1;

      if (firstItem.matiere_info) {
        matiereName = firstItem.matiere_info.nom;
        coefficient = firstItem.matiere_info.coefficient ?? 1;
      } else if (typeof firstItem.matiere !== 'number' && firstItem.matiere) {
        matiereName = firstItem.matiere.nom;
        coefficient = firstItem.matiere.coefficient ?? 1;
      }

      const average = items.reduce((acc, e) => {
        return acc + (e.normalized_note ?? (e.score / e.max_score) * 20);
      }, 0) / items.length;

      return {
        matiereId,
        matiereName,
        evaluations: items,
        average: average.toFixed(2),
        coefficient,
      };
    });
  });



  /**
   * Charge toutes les évaluations
   */
  async loadEvaluations(): Promise<void> {
    await this.evaluationService.getAll({
      trimester: this.selectedTrimester(),
      page_size: 200,
    });
  }

  /**
   * Rafraîchissement tiré (pull to refresh)
   */
  async onRefresh(event: any): Promise<void> {
    try {
      await this.loadEvaluations();
    } finally {
      await event.target.complete();
    }
  }

  /**
   * Charge le bulletin d'un élève
   */
  async loadBulletin(studentId: number): Promise<void> {
    this.loading.set(true);
    const data = await this.evaluationService.getBulletin(
      studentId,
      this.selectedTrimester()
    );

    // Déterminer le nom de l'élève depuis la réponse ou les évaluations locales
    const fallbackName = this.resolveStudentName(studentId);
    if (data) {
      if (!data.student_name || data.student_name.trim() === '') {
        data.student_name = fallbackName;
      }
      this.bulletin.set(data);
      this.selectedStudentName.set(data.student_name);
      this.selectedStudentId.set(studentId);
      this.viewMode.set('bulletin');
    } else {
      this.bulletin.set(null);
    }
    this.loading.set(false);
  }

  /**
   * Bascule le trimestre
   */
  async changeTrimester(trimester: number): Promise<void> {
    this.selectedTrimester.set(trimester);
    if (this.viewMode() === 'bulletin' && this.selectedStudentId()) {
      await this.loadBulletin(this.selectedStudentId()!);
    } else {
      await this.loadEvaluations();
    }
  }

  /**
   * Change le mode d'affichage
   */
  changeViewMode(mode: any): void {
    if (mode && (mode === 'list' || mode === 'bulletin' || mode === 'stats')) {
      this.viewMode.set(mode as ViewMode);
    }
  }

  /**
   * Calcule le score en /20
   */
  getScore20(evaluation: Evaluation): number {
    return evaluation.normalized_note ?? (evaluation.score / evaluation.max_score) * 20;
  }

  /**
   * Retourne la couleur du badge selon la note
   */
  getScoreColor(evaluation: Evaluation): string {
    const score = this.getScore20(evaluation);
    if (score >= 16) return 'success';
    if (score >= 12) return 'warning';
    if (score >= 10) return 'medium';
    return 'danger';
  }

  /**
   * Retourne le label du type d'évaluation
   */
  getEvalTypeLabel(evaluation: Evaluation): string {
    // Utiliser eval_type_display du backend si disponible
    if (evaluation.eval_type_display) {
      return evaluation.eval_type_display;
    }

    const labels: Record<string, string> = {
      CC: 'Contrôle continu',
      EX: 'Examen',
      TP: 'Travaux pratiques',
      DS: 'Devoir surveillé',
      RA: 'Rattrappage',
    };
    return labels[evaluation.eval_type] ?? evaluation.eval_type;
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.searchText.set('');
    this.selectedStudentId.set(null);
  }

  /** Retourne l'identifiant numérique de l'élève même si l'API renvoie une string */
  private getStudentId(evaluation: Evaluation): number | null {
    if (typeof evaluation.student === 'number') return evaluation.student;
    if (typeof evaluation.student === 'string') {
      const parsed = Number(evaluation.student);
      return Number.isNaN(parsed) ? null : parsed;
    }
    if (evaluation.student && typeof evaluation.student === 'object' && 'id' in evaluation.student) {
      return (evaluation.student as any).id ?? null;
    }
    if (evaluation.student_info?.id) return evaluation.student_info.id;
    return null;
  }

  /** Retourne l'identifiant numérique de la matière même si l'API renvoie une string */
  private getMatiereId(evaluation: Evaluation): number | null {
    if (typeof evaluation.matiere === 'number') return evaluation.matiere;
    if (typeof evaluation.matiere === 'string') {
      const parsed = Number(evaluation.matiere);
      return Number.isNaN(parsed) ? null : parsed;
    }
    if (evaluation.matiere && typeof evaluation.matiere === 'object' && 'id' in evaluation.matiere) {
      return (evaluation.matiere as any).id ?? null;
    }
    if (evaluation.matiere_info?.id) return evaluation.matiere_info.id;
    return null;
  }

  /**
   * Trouve le nom d'un élève dans les évaluations locales
   */
  private resolveStudentName(studentId: number): string {
    const all = this.evaluations();
    const found = all.find((e) => {
      const id = this.getStudentId(e);
      return id === studentId;
    });
    return found ? this.getStudentName(found) : 'Inconnu';
  }

  /**
   * Retourne le nom de l'élève
   */
  getStudentName(evaluation: Evaluation): string {
    if (evaluation.student_info) {
      return `${evaluation.student_info.prenom || ''} ${evaluation.student_info.nom || ''}`.trim();
    }
    if (typeof evaluation.student !== 'number' && evaluation.student) {
      return `${evaluation.student.first_name || ''} ${evaluation.student.last_name || ''}`.trim();
    }
    return 'Inconnu';
  }

  /**
   * Retourne le nom de la matière
   */
  getMatiereName(evaluation: Evaluation): string {
    if (evaluation.matiere_info) {
      return evaluation.matiere_info.nom;
    }
    if (typeof evaluation.matiere !== 'number' && evaluation.matiere) {
      return evaluation.matiere.nom;
    }
    return 'Inconnu';
  }


}
