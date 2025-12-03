import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NabarComponent } from "./shared/header/nabar-component/nabar-component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NabarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('edumali-front');
}
