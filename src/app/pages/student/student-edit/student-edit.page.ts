import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Student, StudentEditService } from 'src/app/services/register/student-edit-service';
import { ClasseService } from 'src/app/services/classes/classe-service';
// utilises des composants standalone d'Ionic, ne pas importer `IonicModule` ici
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonCard,
  IonCardContent,
  IonDatetime,
  IonSegment,
  IonSegmentButton
} from '@ionic/angular/standalone';
import { eyeOutline, reloadOutline } from 'ionicons/icons';
@Component({
  selector: 'app-student-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonCard, IonCardContent,
    IonDatetime, IonSegment, IonSegmentButton
  ],
  templateUrl: './student-edit.page.html',
  styleUrls: ['./student-edit.page.scss'],
})
export class StudentEditPage implements OnInit {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentEditService);
  private classeService = inject(ClasseService);
  private router = inject(Router);
  public reloadIcon = reloadOutline;
  public eyeIcon = eyeOutline;
  fullname: string = '';


  form = this.fb.nonNullable.group({
    id: [0],
    classe: [null as number | null],
    date_of_birth: ['', Validators.required],
    gender: ['M' as 'M' | 'F', Validators.required],
    status: ['actif', Validators.required],
    matricule: [''],


  });
  students: Student[] = [];
  classes: any[] = [];
  error: string | null = null;

  async ngOnInit() {
    this.students = await this.studentService.getStudents();
    this.classes = await this.classeService.getClasses();
  }

  async selectStudent(id: number) {
    const student = await this.studentService.getStudent(id);
    this.fullname = `${student.user_detail?.first_name || ''} ${student.user_detail?.last_name || ''}`;

    this.form.patchValue({
      id: student.id!,
      classe: student.classe ?? null,
      date_of_birth: student.date_of_birth,
      gender: student.gender,
      status: student.status,
      matricule: student.matricule || '',
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;

    const { id, ...payload } = this.form.getRawValue();

    await this.studentService.patchStudent(id, payload);
    await this.router.navigateByUrl('/students',);
  }
}
