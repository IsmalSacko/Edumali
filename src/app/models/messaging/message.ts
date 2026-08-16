export interface MessageUserInfo {
  id: number;
  prenom?: string;
  nom?: string;
  username?: string;
}

// Aligné sur MessageSerializer (apps/messaging/serializers.py)
export interface Message {
  id?: number;
  sender?: number;
  sender_info?: MessageUserInfo | null;
  receiver: number;
  receiver_info?: MessageUserInfo | null;
  subject: string;
  content: string;
  created_at?: string;
  read?: boolean;
}

export interface MessageRecipient {
  id: number;
  label: string; // nom affiché dans le sélecteur de destinataire
  // ids d'autres destinataires liés (parent <-> enfant) : cocher ce
  // destinataire propose/coche aussi automatiquement ceux-ci.
  linkedIds?: number[];
}
