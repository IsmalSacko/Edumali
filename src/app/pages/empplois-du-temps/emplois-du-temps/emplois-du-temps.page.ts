import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonBadge,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonChip,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  timeOutline,
  personOutline,
  bookOutline,
  schoolOutline,
  filterOutline,
  reloadOutline,
  chevronForwardOutline,
  searchOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { EmploisService } from '../../../services/emplois-du-temps/emplois-service';
import { EmploiDuTemps, EmploiDuTempsItem, JOUR_SEMAINE_LABELS } from '../../../models/emplois/emplois';
import { ClasseService } from '../../../services/classes/classe-service';
import { ClasseListe } from '../../../models/classe/classes';

@Component({
  selector: 'app-emplois-du-temps',
  templateUrl: './emplois-du-temps.page.html',
  styleUrls: ['./emplois-du-temps.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonBadge,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonChip,
    CommonModule,
    FormsModule,
  ],
})
export class EmploisDuTempsPage implements OnInit {
  // Signals
  emplois = signal<EmploiDuTemps>([]);
  classes = signal<ClasseListe[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Filters
  selectedClasse = signal<number | null>(null);
  selectedDay = signal<number | null>(null);
  search = signal('');

  // Vue mode
  viewMode = signal<'week' | 'list'>('week');

  // Labels jours
  readonly jourLabels = JOUR_SEMAINE_LABELS;
  readonly jours = [1, 2, 3, 4, 5, 6];

  // Computed
  filteredEmplois = computed(() => {
    let result = this.emplois();

    // Filter by day
    const day = this.selectedDay();
    if (day !== null) {
      result = result.filter((e) => e.jour_semaine === day);
    }

    return result;
  });

  emploisByDay = computed(() => {
    return this.emploisService.groupByDay(this.filteredEmplois());
  });

  constructor(
    private emploisService: EmploisService,
    private classeService: ClasseService
  ) {
    addIcons({
      calendarOutline,
      timeOutline,
      personOutline,
      bookOutline,
      schoolOutline,
      filterOutline,
      reloadOutline,
      chevronForwardOutline,
      searchOutline,
      alertCircleOutline,
    });
  }

  async ngOnInit() {
    await this.loadClasses();
    await this.loadEmplois();
  }

  async loadClasses() {
    try {
      const data = await this.classeService.getClasses();
      this.classes.set(data);
    } catch (err) {
      console.error('Erreur chargement classes', err);
    }
  }

  async loadEmplois() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const classeId = this.selectedClasse();
      const jour = this.selectedDay();
      const searchTerm = this.search();

      // Construire les filtres pour l'API
      const filters: any = {};
      if (jour) filters.jour_semaine = jour;
      if (searchTerm) filters.search = searchTerm;

      // Appeler l'API avec filtrage côté backend
      const data = classeId
        ? await this.emploisService.getByClasse(classeId, filters)
        : await this.emploisService.getAll(filters);

      this.emplois.set(data);
    } catch (err: any) {
      this.error.set(err?.message || 'Erreur lors du chargement de l\'emploi du temps');
    } finally {
      this.loading.set(false);
    }
  }

  onClasseChange(event: any) {
    this.selectedClasse.set(event.detail.value);
    this.loadEmplois();
  }

  onDayChange(event: any) {
    this.selectedDay.set(event.detail.value === 'all' ? null : Number(event.detail.value));
  }

  onSearchChange(event: any) {
    this.search.set(event.target.value || '');
    this.loadEmplois();
  }

  resetFilters() {
    this.selectedClasse.set(null);
    this.selectedDay.set(null);
    this.search.set('');
    this.loadEmplois();
  }

  onViewModeChange(event: any) {
    this.viewMode.set(event.detail.value);
  }

  getEmploisForDay(day: number): EmploiDuTempsItem[] {
    const byDay = this.emploisByDay();
    return this.emploisService.sortByStartTime(byDay[day] || []);
  }

  formatTime(time?: string): string {
    if (!time) return '';
    return time.substring(0, 5); // HH:MM
  }
}
