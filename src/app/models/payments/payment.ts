export type PaymentType = 'inscription' | 'mensuality' | 'cantine' | 'transport';
export type PaymentMethod = 'orange' | 'moov' | 'wave' | 'cash';
export type PaymentStatus = 'paid' | 'pending';

export interface PaymentStudentInfo {
  id: number;
  full_name: string;
  email?: string;
}

// Aligné sur PaymentSerializer (apps/payments/serializers.py)
export interface Payment {
  id?: number;
  student: number;
  student_info?: PaymentStudentInfo | null;
  amount: number;
  method: PaymentMethod;
  type_payment: PaymentType;
  paid_at?: string;
  status: PaymentStatus;
  receipt_number?: string | null;
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  inscription: 'Inscription',
  mensuality: 'Mensualité',
  cantine: 'Cantine',
  transport: 'Transport',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  orange: 'Orange Money',
  moov: 'Moov Money',
  wave: 'Wave',
  cash: 'Espèces',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Payé',
  pending: 'En attente',
};
