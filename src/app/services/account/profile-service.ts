import { inject, Injectable, signal } from '@angular/core';
import { ProfileInfo } from '../../models/profile/profile';
import { environment } from '../../../environments/environment';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
   private api = inject(ApiService);
   private readonly base = environment.apiUrl
   private readonly profileURL = `${this.base}/users/me/`;
   public profile = signal<ProfileInfo | null>(null);

    async getProfile() {
      return this.api.get<ProfileInfo>(this.profileURL).then((response: { data: ProfileInfo }) => {
        this.profile.set(response.data);
        console.log('Profile fetched:', response.data);
        return response.data;
      });

  }
    async updateProfile(data: Partial<ProfileInfo>) {
    return this.api.patch<ProfileInfo>(`${this.profileURL}`, data).then((response: { data: ProfileInfo }) => {
      this.profile.set(response.data);
      return response.data;
    });
  }

  async changePassword(data: any) {
    return this.api.patch(`${this.base}/users/me/`, data);
  }

}  

