import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import * as ionIcons from 'ionicons/icons';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Register a small set of common icons used by the app to avoid runtime icon fetch errors
addIcons({
  'clipboard': (ionIcons as any).clipboard,
  'search': (ionIcons as any).search,
  'people': (ionIcons as any).people,
  'school': (ionIcons as any).school,
  'calendar': (ionIcons as any).calendar,
  'menu': (ionIcons as any).menu,
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
