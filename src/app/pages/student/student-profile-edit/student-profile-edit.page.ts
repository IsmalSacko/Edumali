import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-student-profile-edit',
  templateUrl: './student-profile-edit.page.html',
  styleUrls: ['./student-profile-edit.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class StudentProfileEditPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
