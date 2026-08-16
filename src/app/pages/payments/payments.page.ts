import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline, cashOutline, receiptOutline } from 'ionicons/icons';
import { PaymentService } from '../../services/payments/payment.service';
import { StudentServiceList } from '../../services/student/student-service-list';
import {
  Payment,
  PaymentMethod,
  PaymentType,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS,
} from '../../models/payments/payment';
import { Student } from '../../models/student/student';

@Component({
  selector: 'app-payments',
  standalone: true,
  templateUrl: './payments.page.html',
  styleUrls: ['./payments.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    DecimalPipe,
    KeyValuePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonInput,
    IonBadge,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
  ],
})
export class PaymentsPage implements OnInit {
  private paymentService = inject(PaymentService);
  private studentService = inject(StudentServiceList);

  typeLabels = PAYMENT_TYPE_LABELS;
  methodLabels = PAYMENT_METHOD_LABELS;
  statusLabels = PAYMENT_STATUS_LABELS;

  loading = this.paymentService.loading;
  payments = this.paymentService.payments;
  searchText = signal<string>('');
  showForm = signal<boolean>(false);
  students = signal<Student[]>([]);
  saving = signal<boolean>(false);

  formStudent = signal<number | null>(null);
  formAmount = signal<number | null>(null);
  formType = signal<PaymentType>('mensuality');
  formMethod = signal<PaymentMethod>('cash');

  filteredPayments = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    if (!term) return this.payments();
    return this.payments().filter(p =>
      (p.student_info?.full_name ?? '').toLowerCase().includes(term) ||
      (p.receipt_number ?? '').toLowerCase().includes(term)
    );
  });

  totalPaid = computed(() =>
    this.payments()
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0)
  );

  constructor() {
    addIcons({ addOutline, closeOutline, cashOutline, receiptOutline });
  }

  async ngOnInit() {
    await this.load();
  }

  async load() {
    await this.paymentService.getAll();
  }

  async openForm() {
    this.formStudent.set(null);
    this.formAmount.set(null);
    this.formType.set('mensuality');
    this.formMethod.set('cash');
    if (!this.students().length) {
      this.students.set(await this.studentService.getStudents());
    }
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  async submitForm() {
    const student = this.formStudent();
    const amount = this.formAmount();
    if (!student || !amount || amount <= 0) return;
    this.saving.set(true);
    const result = await this.paymentService.create({
      student,
      amount,
      type_payment: this.formType(),
      method: this.formMethod(),
      status: 'paid',
    });
    this.saving.set(false);
    if (result) {
      this.showForm.set(false);
      await this.load();
    }
  }

  studentLabel(s: Student): string {
    return `${s.user.first_name ?? ''} ${s.user.last_name ?? ''}`.trim();
  }

  statusColor(status: Payment['status']): string {
    return status === 'paid' ? 'success' : 'warning';
  }

  async onRefresh(event: any) {
    try {
      await this.load();
    } finally {
      event.target.complete();
    }
  }
}
