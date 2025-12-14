import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { NavPage } from "./shared/nav/nav.page";
import { FooterPage } from './shared/footer/footer.page';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, NavPage, FooterPage],
})
export class AppComponent {
  constructor() {}
}
