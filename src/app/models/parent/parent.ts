export interface EnfantBrief {
  id: number;
  nom: string;
}

export interface ParentUserInfo {
  id: number;
  prenom: string;
  nom: string;
  username: string;
}

// Aligné sur ParentSerializer (apps/accounts/serializers.py)
export interface Parent {
  id: number;
  user: number;
  user_info: ParentUserInfo;
  enfants: number[];
  enfants_info: EnfantBrief[];
}
