import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Utilise IonicModule plutôt que composants standalone pour éviter doublons
import { StudentServiceList } from 'src/app/services/student/student-service-list';
import { Student } from 'src/app/models/student/student';
import { IonicModule } from "@ionic/angular";
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';
import { createOutline, mailOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-student-detail',
  templateUrl: './student-detail.page.html',
  styleUrls: ['./student-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class StudentDetailPage implements OnInit {
  createIcon = createOutline;
  mailIcon = mailOutline;
  backIcon = arrowBackOutline;
  studentId: number | null = null;
  student = signal<Student | null>(null);
  private detailService = inject(StudentServiceList);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public imageBaseUrl = environment.imageUrl || environment.apiUrl;
  private adminUrl = environment.adminUrl + '/accounts/student';

  constructor() { }

  ngOnInit() {
    this.loadStudentDetail();
  }

  async loadStudentDetail() {
    const id = this.route.snapshot.paramMap.get('id');
    this.studentId = id ? +id : null;
    if (this.studentId !== null) {
      const student = await this.detailService.getStudent(this.studentId);
      this.student.set(student);
    }
  }

  getImageUrl(photoPath: string | null): string {
    if (photoPath) {
      return this.imageBaseUrl + photoPath;
    } else {
      return 'assets/avatar/default.png';
    }
  }
  editStudent() {
    if (this.studentId !== null) {
      window.open(`${this.adminUrl}/${this.studentId}/change/`, '_blank');
    }
  }


}
