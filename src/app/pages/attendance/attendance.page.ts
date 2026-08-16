import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonSegment,
  IonSegmentButton,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonList,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  documentTextOutline,
  calendarOutline,
  peopleOutline,
  saveOutline,
} from 'ionicons/icons';
import { AttendanceService } from '../../services/attendance/attendance.service';
import { ClasseService } from '../../services/classes/classe-service';
import { StudentServiceList } from '../../services/student/student-service-list';
import { AuthService } from '../../services/auth/auth.service';
import { AttendanceStatus, ATTENDANCE_STATUS_LABELS } from '../../models/attendance/attendance';
import { ClasseListe } from '../../models/classe/classes';
import { Student } from '../../models/student/student';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonSegment,
    IonSegmentButton,
    IonBadge,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonList,
  ],
})
export class AttendancePage implements OnInit {
  private attendanceService = inject(AttendanceService);
  private classeService = inject(ClasseService);
  private studentService = inject(StudentServiceList);
  private auth = inject(AuthService);

  statusLabels = ATTENDANCE_STATUS_LABELS;

  role = computed(() => this.auth.user()?.role ?? null);
  canMark = computed(() => ['admin', 'teacher', 'surveillant'].includes(this.role() ?? ''));

  // Mode enseignant/admin : roster d'une classe à une date
  classes = signal<ClasseListe[]>([]);
  selectedClasse = signal<number | null>(null);
  selectedDate = signal<string>(todayIso());
  roster = this.attendanceService.roster;
  loadingRoster = this.attendanceService.loading;
  saving = signal<boolean>(false);
  // Brouillon local des statuts saisis avant enregistrement
  draft = signal<Record<number, { status: AttendanceStatus | null; remark: string }>>({});

  // Mode parent/élève : historique lecture seule
  myStudents = signal<Student[]>([]);
  selectedStudentId = signal<number | null>(null);
  history = this.attendanceService.attendances;
  loadingHistory = signal<boolean>(false);

  constructor() {
    addIcons({ checkmarkCircleOutline, closeCircleOutline, documentTextOutline, calendarOutline, peopleOutline, saveOutline });
  }

  async ngOnInit() {
    if (this.canMark()) {
      await this.loadClasses();
    } else {
      await this.loadMyStudents();
    }
  }

  async loadClasses() {
    this.classes.set(await this.classeService.getClasses());
  }

  async onClasseOrDateChange() {
    const classeId = this.selectedClasse();
    if (!classeId) return;
    const items = await this.attendanceService.getRoster(classeId, this.selectedDate());
    const d: Record<number, { status: AttendanceStatus | null; remark: string }> = {};
    for (const it of items) {
      d[it.student_id] = { status: it.status, remark: it.remark ?? '' };
    }
    this.draft.set(d);
  }

  setStatus(studentId: number, status: AttendanceStatus) {
    const d = { ...this.draft() };
    const current = d[studentId] ?? { status: null, remark: '' };
    d[studentId] = { ...current, status };
    this.draft.set(d);
  }

  setRemark(studentId: number, remark: string) {
    const d = { ...this.draft() };
    const current = d[studentId] ?? { status: null, remark: '' };
    d[studentId] = { ...current, remark };
    this.draft.set(d);
  }

  markedCount = computed(() => Object.values(this.draft()).filter(v => v.status).length);

  async saveRoster() {
    const classeId = this.selectedClasse();
    if (!classeId) return;
    const entries = Object.entries(this.draft())
      .filter(([, v]) => v.status)
      .map(([studentId, v]) => ({ student: Number(studentId), status: v.status as AttendanceStatus, remark: v.remark }));

    if (!entries.length) return;

    this.saving.set(true);
    const ok = await this.attendanceService.bulkMark(classeId, this.selectedDate(), entries);
    this.saving.set(false);
    if (ok) {
      await this.onClasseOrDateChange();
    }
  }

  async loadMyStudents() {
    this.loadingHistory.set(true);
    const students = await this.studentService.getStudents();
    this.myStudents.set(students);
    if (students.length === 1 && students[0].id) {
      this.selectedStudentId.set(students[0].id);
      await this.loadHistory();
    }
    this.loadingHistory.set(false);
  }

  async onStudentChange() {
    await this.loadHistory();
  }

  async loadHistory() {
    const studentId = this.selectedStudentId();
    if (!studentId) return;
    this.loadingHistory.set(true);
    await this.attendanceService.getAll({ student: studentId });
    this.loadingHistory.set(false);
  }

  async onRefresh(event: any) {
    try {
      if (this.canMark()) {
        await this.onClasseOrDateChange();
      } else {
        await this.loadHistory();
      }
    } finally {
      event.target.complete();
    }
  }

  statusColor(status: AttendanceStatus | null | undefined): string {
    if (status === 'present') return 'success';
    if (status === 'absent') return 'danger';
    if (status === 'justified') return 'warning';
    return 'medium';
  }
}
