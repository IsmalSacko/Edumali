import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root' // rendu global automatiquement
})
export class UtilsService {

    constructor() { }

    getImageUrl(photo?: string | null | undefined): string | null {
        if (!photo) return null;
        if (photo.startsWith('http')) return photo;
        const base = (environment.imageUrl || environment.apiUrl || '').replace(/\/+$/, '');
        const path = photo.startsWith('/') ? photo : `/${photo}`;
        return `${base}${path}`;
    }

}
