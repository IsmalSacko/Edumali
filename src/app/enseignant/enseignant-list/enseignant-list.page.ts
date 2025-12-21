import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonList, IonCard, IonItem, IonAvatar, IonLabel, IonChip, IonButtons, IonButton } from '@ionic/angular/standalone';
import { Enseignant } from 'src/app/models/enseignant/enseignant';
import { EnseignantServiceList } from 'src/app/services/enseignant/ensignant-service-list';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-enseignant-list',
  templateUrl: './enseignant-list.page.html',
  styleUrls: ['./enseignant-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonIcon, IonList, IonCard, IonItem, IonAvatar, IonLabel, IonChip, IonButtons, IonButton]
})
export class EnseignantListPage implements OnInit {

  enseignantServiceList = inject(EnseignantServiceList);
  enseignants = signal<Enseignant[]>([]);
  public apiBase = environment.imageUrl || environment.apiUrl;
  constructor() { }

  ngOnInit() {
    this.loadStudents();
  }

  async loadStudents() {
    const enseignants = await this.enseignantServiceList.getTeachers();
    this.enseignants.set(enseignants);
  }

  totalStudents(item: Enseignant): number {
    const classes = item.classes || [];
    return classes.reduce((acc, c: any) => acc + (c.nombre_eleves ?? (c.eleves?.length ?? 0)), 0);
  }

}
