import { Component, computed, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
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
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  layersOutline,
  searchOutline,
  reloadOutline,
  bookOutline,
  peopleOutline,
  schoolOutline,
  chevronForwardOutline,
  closeOutline,
  alertCircleOutline,
  calendarOutline,
  homeOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { ClasseService } from '../../../services/classes/classe-service';
import { Classe, ClasseListe, Cycle } from '../../../models/classe/classes';

@Component({
  selector: 'app-classe',
  templateUrl: './classe.page.html',
  styleUrls: ['./classe.page.scss'],
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
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonSpinner,
    CommonModule,
    FormsModule,
  ],
})
export class ClassePage implements OnInit {
  // Signals
  classes = signal<ClasseListe[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  search = signal('');
  yearFilter = signal<number | null>(null);
  cycleFilter = signal<Cycle | null>(null);

  selectedClasse = signal<Classe | null>(null);
  detailLoading = signal(false);

  // Computed
  filteredClasses = computed(() => {
    let result = this.classes();

    // Search
    const s = this.search().toLowerCase();
    if (s) {
      result = result.filter((c) =>
        c.nom.toLowerCase().includes(s) || c.annee_display.toLowerCase().includes(s)
      );
    }

    // Year filter
    const y = this.yearFilter();
    if (y !== null) {
      result = result.filter((c) => c.annee === y);
    }

    // Cycle filter (approximation: on peut déduire cycle du nom de classe si nécessaire)
    // Pour simplifier, on suppose que le backend renvoie le cycle ou on le déduit du nom
    const cycle = this.cycleFilter();
    if (cycle) {
      // Exemple: filtrer par nom (1ère, 2nde, etc.) ou par un champ cycle si disponible
      // Ici on filtre de façon simple selon les préfixes communs
      result = result.filter((c) => this.matchCycle(c.nom, cycle));
    }

    return result;
  });

  availableYears = computed(() => {
    const years = this.classes().map((c) => c.annee);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  });

  totalMatieres = computed(() => {
    return this.filteredClasses().reduce((sum, c) => sum + c.nombre_matieres, 0);
  });

  totalEleves = computed(() => {
    return this.filteredClasses().reduce((sum, c) => sum + c.nombre_eleves, 0);
  });

  constructor(private classeService: ClasseService) {
    addIcons({
      layersOutline,
      searchOutline,
      reloadOutline,
      bookOutline,
      peopleOutline,
      schoolOutline,
      chevronForwardOutline,
      closeOutline,
      alertCircleOutline,
      calendarOutline,
      homeOutline,
      checkmarkCircleOutline,
    });

  }

  async ngOnInit() {
    // Injecter les styles personnalisés pour les modals de select
    this.injectSelectModalStyles();
    await this.loadClasses();
  }

  async loadClasses() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.classeService.getClasses();
      this.classes.set(data);
    } catch (err: any) {
      this.error.set(err?.message || 'Erreur lors du chargement des classes');
    } finally {
      this.loading.set(false);
    }
  }

  onSearchChange(event: any) {
    this.search.set(event.target.value || '');
  }

  onYearFilterChange(event: any) {
    this.yearFilter.set(event.detail.value);
  }

  onCycleFilterChange(event: any) {
    this.cycleFilter.set(event.detail.value);
  }

  resetFilters() {
    this.search.set('');
    this.yearFilter.set(null);
    this.cycleFilter.set(null);
  }

  async openClasseDetail(id: number) {
    this.detailLoading.set(true);
    this.selectedClasse.set(null);
    try {
      const detail = await this.classeService.getClasseDetail(id);
      this.selectedClasse.set(detail);
    } catch (err) {
      console.error('Erreur détail classe', err);
    } finally {
      this.detailLoading.set(false);
    }
  }

  closeClasseDetail() {
    this.selectedClasse.set(null);
  }

  getClasseIcon(index: number) {
    const icons = [
      { name: 'home-outline', color: 'primary' },
      { name: 'layers-outline', color: 'secondary' },
      { name: 'school-outline', color: 'tertiary' },
      { name: 'book-outline', color: 'success' },
      { name: 'people-outline', color: 'warning' },
      { name: 'calendar-outline', color: 'danger' },
    ];
    return icons[index % icons.length];
  }

  private matchCycle(nom: string, cycle: Cycle): boolean {
    const lower = nom.toLowerCase();
    switch (cycle) {
      case 'primaire':
        return /^(cp|ce|cm)/.test(lower) || lower.includes('primaire');
      case 'secondaire':
        return /^(6|5|4|3)/.test(lower) || lower.includes('collège') || lower.includes('secondaire');
      case 'lycee':
        return /^(2nd|1|term)/.test(lower) || lower.includes('lycée');
      default:
        return true;
    }
  }

  private injectSelectModalStyles() {
    // Créer une balise style globale pour le modal de select
    const styleId = 'select-modal-theme-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Styles globaux pour les modals select */
        .select-popover,
        .select-action-sheet,
        .alert-wrapper,
        .sc-ion-popover-md,
        .sc-ion-select-md {
          --background: var(--ion-background-color) !important;
          --color: var(--ion-text-color) !important;
          background-color: var(--ion-background-color) !important;
          color: var(--ion-text-color) !important;
        }
        
        .select-popover *,
        .select-action-sheet *,
        .alert-wrapper *,
        .sc-ion-popover-md *,
        .themed-select-modal * {
          color: var(--ion-text-color) !important;
          background-color: var(--ion-background-color) !important;
        }
        
        .select-popover .option,
        .select-action-sheet .option,
        .alert-wrapper .option {
          color: var(--ion-text-color) !important;
          background-color: var(--ion-background-color) !important;
        }
        
        .select-popover .option.selected,
        .select-action-sheet .option.selected,
        .alert-wrapper .option.selected {
          background-color: color-mix(in srgb, var(--ion-color-primary) 25%, var(--ion-background-color)) !important;
          color: var(--ion-text-color) !important;
        }
        
        .select-popover .option:hover,
        .select-action-sheet .option:hover,
        .alert-wrapper .option:hover {
          background-color: color-mix(in srgb, var(--ion-color-primary) 20%, var(--ion-background-color)) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
}
