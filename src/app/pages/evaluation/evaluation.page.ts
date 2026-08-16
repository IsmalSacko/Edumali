import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  IonSelect,
  IonSelectOption,
  IonInput,
  IonItem,
  IonTextarea,
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
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { AuthService } from '../../services/auth/auth.service';
import { ClasseService } from '../../services/classes/classe-service';
import { MatiereService } from '../../services/classes/matiere-service';
import { StudentServiceList } from '../../services/student/student-service-list';
import { EnseignantServiceList } from '../../services/enseignant/ensignant-service-list';
import { Evaluation, Bulletin, EvaluationRosterEntry } from '../../models/student-info/model';
import { ClasseListe, Matiere } from '../../models/classe/classes';
import { Student } from '../../models/student/student';
import { Enseignant } from '../../models/enseignant/enseignant';

type ViewMode = 'list' | 'saisie' | 'bulletin' | 'stats';
type SaisieSubMode = 'individuelle' | 'groupee';
type EvalType = 'CC' | 'EX' | 'TP' | 'DS' | 'RA';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

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
    IonSelect,
    IonSelectOption,
    IonInput,
    IonItem,
    IonTextarea,
  ],
})
export class EvaluationPage implements OnInit {
  private evaluationService = inject(EvaluationService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private classeService = inject(ClasseService);
  private matiereService = inject(MatiereService);
  private studentService = inject(StudentServiceList);
  private enseignantService = inject(EnseignantServiceList);

  // États
  viewMode = signal<ViewMode>('list');
  selectedStudentId = signal<number | null>(null);
  selectedStudentName = signal<string>('');
  selectedTrimester = signal<number>(1);
  searchText = signal<string>('');
  loading = signal<boolean>(false);
  showFilters = signal<boolean>(false);

  // --- Saisie de notes (roster + bulk) ---
  classes = signal<ClasseListe[]>([]);
  classeMatieres = signal<Matiere[]>([]);
  saisieClasseId = signal<number | null>(null);
  saisieMatiereId = signal<number | null>(null);
  saisieEvalType = signal<EvalType>('CC');
  saisieDate = signal<string>(todayIso());
  saisieMaxScore = signal<number>(20);
  roster = this.evaluationService.roster;
  rosterLoading = this.evaluationService.loading;
  saisieDraft = signal<Record<number, { score: number | null; comment: string }>>({});
  saving = signal<boolean>(false);
  // Élève ciblé explicitement (comme dans l'admin Django, où on choisit un
  // élève précis) : null = toute la classe. La grille filtre sur ce choix,
  // mais l'enregistrement passe toujours par le même mécanisme en dessous.
  saisieStudentId = signal<number | null>(null);
  filteredRoster = computed(() => {
    const studentId = this.saisieStudentId();
    const all = this.roster();
    return studentId ? all.filter(r => r.student_id === studentId) : all;
  });

  // --- Saisie individuelle (un élève à la fois, comme le formulaire admin) ---
  saisieSubMode = signal<SaisieSubMode>('individuelle');
  allStudents = signal<Student[]>([]);
  allMatieres = signal<Matiere[]>([]);
  allTeachers = signal<Enseignant[]>([]);
  indivStudentId = signal<number | null>(null);
  indivMatiereId = signal<number | null>(null);
  indivTeacherId = signal<number | null>(null);
  indivEvalType = signal<EvalType>('CC');
  indivScore = signal<number | null>(null);
  indivMaxScore = signal<number>(20);
  indivDate = signal<string>(todayIso());
  indivTrimester = signal<number>(1);
  indivCycle = signal<string | null>(null);
  indivComment = signal<string>('');
  indivSaving = signal<boolean>(false);

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
    // Deep-link /bulletin/:studentId/:trimester (depuis notifications/dashboard) :
    // ouvre directement le bulletin d'un élève sans repasser par la liste.
    const studentIdParam = this.route.snapshot.paramMap.get('studentId');
    const trimesterParam = this.route.snapshot.paramMap.get('trimester');
    if (studentIdParam) {
      const studentId = Number(studentIdParam);
      const trimester = Number(trimesterParam) || 1;
      if (!Number.isNaN(studentId)) {
        this.selectedTrimester.set(trimester);
        this.loadBulletin(studentId);
        return;
      }
    }
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
    if (mode && (mode === 'list' || mode === 'saisie' || mode === 'bulletin' || mode === 'stats')) {
      this.viewMode.set(mode as ViewMode);
      if (mode === 'saisie' && !this.classes().length) {
        this.loadClasses();
        this.loadIndividuelleData();
      }
    }
  }

  // --- Saisie de notes ---

  async loadClasses() {
    this.classes.set(await this.classeService.getClasses());
  }

  async onSaisieClasseChange() {
    const classeId = this.saisieClasseId();
    this.saisieMatiereId.set(null);
    this.classeMatieres.set([]);
    this.saisieDraft.set({});
    this.saisieMaxScore.set(20);
    this.saisieStudentId.set(null);
    if (!classeId) return;
    const detail = await this.classeService.getClasseDetail(classeId);
    this.classeMatieres.set(detail.matieres ?? []);
  }

  async onSaisieParamsChange() {
    const classeId = this.saisieClasseId();
    const matiereId = this.saisieMatiereId();
    if (!classeId || !matiereId) return;
    // Repart d'une note maximale par défaut à chaque changement de
    // classe/matière/type/date : sinon, en l'absence de notes existantes
    // pour la nouvelle combinaison, la valeur restait celle laissée par la
    // sélection précédente au lieu de revenir à 20 par défaut.
    this.saisieMaxScore.set(20);
    const items = await this.evaluationService.getRoster(
      classeId, matiereId, this.selectedTrimester(), this.saisieEvalType(), this.saisieDate()
    );
    const d: Record<number, { score: number | null; comment: string }> = {};
    for (const it of items) {
      d[it.student_id] = { score: it.score, comment: it.comment ?? '' };
      if (it.max_score) this.saisieMaxScore.set(it.max_score);
    }
    this.saisieDraft.set(d);
  }

  setSaisieScore(studentId: number, score: number | null) {
    const d = { ...this.saisieDraft() };
    const current = d[studentId] ?? { score: null, comment: '' };
    d[studentId] = { ...current, score };
    this.saisieDraft.set(d);
  }

  setSaisieComment(studentId: number, comment: string) {
    const d = { ...this.saisieDraft() };
    const current = d[studentId] ?? { score: null, comment: '' };
    d[studentId] = { ...current, comment };
    this.saisieDraft.set(d);
  }

  saisieMarkedCount(): number {
    return Object.values(this.saisieDraft()).filter(v => v.score !== null && v.score !== undefined).length;
  }

  async saveSaisie() {
    const classeId = this.saisieClasseId();
    const matiereId = this.saisieMatiereId();
    if (!classeId || !matiereId) return;
    const entries = Object.entries(this.saisieDraft())
      .filter(([, v]) => v.score !== null && v.score !== undefined)
      .map(([studentId, v]) => ({ student: Number(studentId), score: v.score as number, comment: v.comment }));
    if (!entries.length) return;

    this.saving.set(true);
    const ok = await this.evaluationService.bulkSubmit({
      classe: classeId,
      matiere: matiereId,
      eval_type: this.saisieEvalType(),
      trimester: this.selectedTrimester(),
      date: this.saisieDate(),
      max_score: this.saisieMaxScore(),
      entries,
    });
    this.saving.set(false);
    if (ok) {
      await this.onSaisieParamsChange();
    }
  }

  /** Charge les listes complètes (élèves/matières/enseignants) pour le
   * formulaire de saisie individuelle — même principe que le formulaire
   * d'ajout d'évaluation de l'admin Django (un élève choisi directement,
   * pas de passage obligé par une classe). */
  async loadIndividuelleData() {
    const [students, matieres, teachers] = await Promise.all([
      this.studentService.getStudents(),
      this.matiereService.getMatieres(),
      this.enseignantService.getTeachers(),
    ]);
    this.allStudents.set(students);
    this.allMatieres.set(matieres);
    this.allTeachers.set(teachers);

    // Un enseignant connecté est présélectionné sur lui-même (modifiable —
    // un admin peut vouloir noter au nom d'un autre professeur).
    const currentUserId = this.auth.user()?.id;
    const self = teachers.find(t => t.user?.id === currentUserId);
    if (self?.id) this.indivTeacherId.set(self.id);
  }

  studentLabel(s: Student): string {
    return `${s.user.first_name ?? ''} ${s.user.last_name ?? ''}`.trim() || s.user.username || 'Élève';
  }

  teacherLabel(t: Enseignant): string {
    return `${t.user.first_name ?? ''} ${t.user.last_name ?? ''}`.trim() || t.user.username || 'Enseignant';
  }

  indivReady(): boolean {
    return !!(this.indivStudentId() && this.indivMatiereId() && this.indivScore() !== null && this.indivScore() !== undefined);
  }

  async submitIndividuelle() {
    if (!this.indivReady()) return;
    this.indivSaving.set(true);
    const result = await this.evaluationService.create({
      student: this.indivStudentId()!,
      matiere: this.indivMatiereId()!,
      teacher: this.indivTeacherId(),
      eval_type: this.indivEvalType(),
      score: this.indivScore()!,
      max_score: this.indivMaxScore(),
      date: this.indivDate(),
      trimester: this.indivTrimester(),
      cycle: this.indivCycle(),
      comment: this.indivComment(),
    });
    this.indivSaving.set(false);
    if (result) {
      // Repart sur un formulaire vierge, prêt pour la note suivante — sauf
      // élève/matière/enseignant/type/date, souvent identiques d'une saisie
      // à l'autre (plusieurs notes de suite pour la même classe/matière).
      this.indivScore.set(null);
      this.indivComment.set('');
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
