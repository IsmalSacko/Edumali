import { ProfileInfo } from "../profile/profile";
import { Classe } from "../classe/classes";

export interface Enseignant {
    id?: number;
    specialty?: string;
    classes?: Classe[];
    user: ProfileInfo;
}