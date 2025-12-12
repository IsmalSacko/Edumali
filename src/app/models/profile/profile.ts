export interface ProfileInfo {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: 'student' | 'teacher' | 'admin' | 'parent';
  date_joined?: string; // ISO date string
  is_active?: boolean;
  is_staff?: boolean;
  phone_number?: string | null;
  profile_photo?: string | null; // URL to profile photo
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}