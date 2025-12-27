import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnseignantServiceList } from 'src/app/services/enseignant/ensignant-service-list';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Enseignant } from 'src/app/models/enseignant/enseignant';
import { IonicModule } from "@ionic/angular";
import { chevronForward, mailOutline, peopleOutline, reloadOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UtilsService } from 'src/app/services/utils/image-url-service';

@Component({
  selector: 'app-enseignant-detail',
  templateUrl: './enseignant-detail.page.html',
  styleUrls: ['./enseignant-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterLink]
})
export class EnseignantDetailPage implements OnInit {
  reload() {
    throw new Error('Method not implemented.');
  }
  iconChevronForward = chevronForward;
  peopleOutline = peopleOutline;
  reloadOutline = reloadOutline;
  mailOutline = mailOutline;
  private enseignantService = inject(EnseignantServiceList);
  private route = inject(ActivatedRoute);
  enseignant = signal<Enseignant | null>(null);
  imgUrl = environment.imageUrl
  private utils = inject(UtilsService);


  ngOnInit() {
    this.loadEnseignantDetail();
  }
  async loadEnseignantDetail() {
    const id = this.route.snapshot.paramMap.get('id');
    const enseignantId = id ? +id : null;
    if (enseignantId !== null) {
      const enseignant = await this.enseignantService.getTeacher(enseignantId);
      console.log('enseignant detail loaded:', enseignant);
      this.enseignant.set(enseignant);
    }
  }



  getTotalEleves(e: any): number {
    if (!e?.classes?.length) return 0;
    return e.classes.reduce((sum: number, c: any) =>
      sum + (c.nombre_eleves ?? (c.eleves?.length ?? 0)), 0);
  }

  getImageUrl(photo?: string | null): string | null {
    return this.utils.getImageUrl(photo);
  }

}
