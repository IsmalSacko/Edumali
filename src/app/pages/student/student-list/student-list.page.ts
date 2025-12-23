import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonAvatar, IonNote, IonIcon, IonCard, IonButton, IonSearchbar, IonSelect, IonSelectOption, IonInput } from '@ionic/angular/standalone';
import { Student } from 'src/app/models/student/student';
import { StudentServiceList } from 'src/app/services/student/student-service-list';
import { ClasseService } from 'src/app/services/classes/classe-service';
import { list } from 'ionicons/icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.page.html',
  styleUrls: ['./student-list.page.scss'],
  standalone: true,
  imports: [IonContent,
    CommonModule,
    FormsModule,
    IonAvatar, IonIcon, IonButton, IonSearchbar, IonSelect, IonSelectOption, IonInput]
})
export class StudentListPage implements OnInit {
  studentServiceList = inject(StudentServiceList);
  students = signal<Student[]>([]);
  statusFilter = signal<string | null>(null);
  genderFilter = signal<string | null>(null);
  search = signal<string>('');
  classes = signal<any[]>([]);
  classeFilter = signal<number | null>(null);
  matriculeFilter = signal<string | null>(null);
  private classeService = inject(ClasseService);
  public apiBase = environment.imageUrl || environment.apiUrl;
  constructor() { }

  ngOnInit() {
    this.loadStudents();
    this.loadClasses();
  }

  async loadStudents() {
    const students = await this.studentServiceList.getStudents();
    this.students.set(students);
  }


  async loadClasses() {
    try {
      const data = await this.classeService.getClasses();
      this.classes.set(data);
    } catch (e) {
      this.classes.set([]);
    }
  }
  reload() {
    this.loadStudents();
  }

  onSearchChange(ev: any) {
    this.search.set(ev?.detail?.value ?? ev?.target?.value ?? '');
  }

  onStatusChange(ev: any) {
    this.statusFilter.set(ev?.detail?.value ?? null);
  }

  onGenderChange(ev: any) {
    this.genderFilter.set(ev?.detail?.value ?? null);
  }

  onClasseChange(ev: any) {
    this.classeFilter.set(ev?.detail?.value ?? null);
  }

  onMatriculeChange(ev: any) {
    this.matriculeFilter.set(ev?.detail?.value ?? ev?.target?.value ?? null);
  }

  filteredStudents(): Student[] {
    return this.students().filter(s => {
      const q = (this.search() || '').toLowerCase();
      if (q) {
        const name = ((s.user?.first_name || '') + ' ' + (s.user?.last_name || '')).toLowerCase();
        if (!name.includes(q) && !(s.matricule || '').toLowerCase().includes(q)) return false;
      }
      if (this.statusFilter()) {
        if (s.status !== this.statusFilter()) return false;
      }
      if (this.genderFilter()) {
        if (s.gender !== this.genderFilter()) return false;
      }
      if (this.classeFilter()) {
        if (!s.classe || s.classe.id !== this.classeFilter()) return false;
      }
      if (this.matriculeFilter()) {
        if (!s.matricule || !s.matricule.toLowerCase().includes((this.matriculeFilter() || '').toLowerCase())) return false;
      }
      return true;
    });
  }

  studentRows(): Student[][] {
    const arr = this.filteredStudents();
    const rows: Student[][] = [];
    for (let i = 0; i < arr.length; i += 4) {
      rows.push(arr.slice(i, i + 4));
    }
    return rows;
  }




  getImageUrl(photo?: string | null): string | null {
    if (!photo) return null;
    if (photo.startsWith('http')) return photo;
    const base = (environment.imageUrl || environment.apiUrl || '').replace(/\/+$/, '');
    const path = photo.startsWith('/') ? photo : `/${photo}`;
    return `${base}${path}`;
  }

}
