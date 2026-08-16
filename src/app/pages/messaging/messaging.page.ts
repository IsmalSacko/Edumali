import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonItem,
  IonLabel,
  IonList,
  IonCheckbox,
  IonInput,
  IonTextarea,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sendOutline, trashOutline, mailOpenOutline, mailUnreadOutline, addOutline, closeOutline } from 'ionicons/icons';
import { MessagingService } from '../../services/messaging/messaging.service';
import { EnseignantServiceList } from '../../services/enseignant/ensignant-service-list';
import { StudentServiceList } from '../../services/student/student-service-list';
import { ParentServiceList } from '../../services/parent/parent-service-list';
import { AuthService } from '../../services/auth/auth.service';
import { Message, MessageRecipient } from '../../models/messaging/message';

type Box = 'inbox' | 'sent';

@Component({
  selector: 'app-messaging',
  standalone: true,
  templateUrl: './messaging.page.html',
  styleUrls: ['./messaging.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonList,
    IonCheckbox,
    IonInput,
    IonTextarea,
    IonBadge,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonSegment,
    IonSegmentButton,
  ],
})
export class MessagingPage implements OnInit {
  private messagingService = inject(MessagingService);
  private enseignantService = inject(EnseignantServiceList);
  private studentService = inject(StudentServiceList);
  private parentService = inject(ParentServiceList);
  private auth = inject(AuthService);

  currentUser = this.auth.user;
  box = signal<Box>('inbox');
  showCompose = signal<boolean>(false);
  loading = this.messagingService.loading;
  selectedMessage = signal<Message | null>(null);

  recipients = signal<MessageRecipient[]>([]);
  // Sélection multiple : un id peut être coché/décoché, plus lié
  // automatiquement à un autre (parent <-> enfant) via linkedIds.
  composeReceivers = signal<Set<number>>(new Set());
  composeSubject = signal<string>('');
  composeContent = signal<string>('');
  sending = signal<boolean>(false);
  recipientSearch = signal<string>('');

  // "Tout cocher" réservé à l'admin/surveillant (diffusion) — un enseignant
  // ou un parent n'a pas de raison d'écrire à tout le monde d'un coup.
  canSelectAll = computed(() => ['admin', 'surveillant'].includes(this.currentUser()?.role ?? ''));

  filteredRecipients = computed(() => {
    const term = this.recipientSearch().trim().toLowerCase();
    if (!term) return this.recipients();
    return this.recipients().filter(r => r.label.toLowerCase().includes(term));
  });

  inbox = computed(() =>
    this.messagingService
      .messages()
      .filter(m => m.receiver === this.currentUser()?.id)
      .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
  );
  sent = computed(() =>
    this.messagingService
      .messages()
      .filter(m => m.sender === this.currentUser()?.id)
      .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
  );
  visibleMessages = computed(() => (this.box() === 'inbox' ? this.inbox() : this.sent()));

  constructor() {
    addIcons({ sendOutline, trashOutline, mailOpenOutline, mailUnreadOutline, addOutline, closeOutline });
  }

  async ngOnInit() {
    await Promise.all([this.loadMessages(), this.loadRecipients()]);
  }

  async loadMessages() {
    await this.messagingService.getInbox();
    await this.messagingService.refreshUnreadCount();
  }

  async loadRecipients() {
    // ParentServiceList retourne une liste vide (pas une erreur) pour les
    // rôles non-personnel — voir ParentViewRealOnly.get_queryset côté back.
    const [teachers, students, parents] = await Promise.all([
      this.enseignantService.getTeachers(),
      this.studentService.getStudents(),
      this.parentService.getParents(),
    ]);

    // Lien élève <-> parent(s) par id User (pas l'id du profil Student, qui
    // sert de clé dans Parent.enfants) : on traduit via la liste d'élèves
    // pour retrouver le user_id correspondant à chaque profil enfant.
    const studentProfileIdToUserId = new Map<number, number>();
    for (const s of students) {
      if (s.id && s.user?.id) studentProfileIdToUserId.set(s.id, s.user.id);
    }
    const studentUserIdToParentUserIds = new Map<number, number[]>();
    const parentUserIdToStudentUserIds = new Map<number, number[]>();
    for (const p of parents) {
      const parentUserId = p.user_info?.id;
      if (!parentUserId) continue;
      const childUserIds = (p.enfants ?? [])
        .map(profileId => studentProfileIdToUserId.get(profileId))
        .filter((id): id is number => !!id);
      if (childUserIds.length) parentUserIdToStudentUserIds.set(parentUserId, childUserIds);
      for (const childUserId of childUserIds) {
        const list = studentUserIdToParentUserIds.get(childUserId) ?? [];
        list.push(parentUserId);
        studentUserIdToParentUserIds.set(childUserId, list);
      }
    }

    const fromTeachers: MessageRecipient[] = teachers
      .filter(t => t.user?.id && t.user.id !== this.currentUser()?.id)
      .map(t => ({ id: t.user.id!, label: `${t.user.first_name ?? ''} ${t.user.last_name ?? ''} (Prof.)`.trim() }));
    const fromStudents: MessageRecipient[] = students
      .filter(s => s.user?.id && s.user.id !== this.currentUser()?.id)
      .map(s => ({
        id: s.user.id!,
        label: `${s.user.first_name ?? ''} ${s.user.last_name ?? ''} (Élève)`.trim(),
        linkedIds: studentUserIdToParentUserIds.get(s.user.id!),
      }));
    const fromParents: MessageRecipient[] = parents
      .filter(p => p.user_info?.id && p.user_info.id !== this.currentUser()?.id)
      .map(p => {
        const enfants = p.enfants_info?.map(e => e.nom).join(', ');
        const suffix = enfants ? `Parent de ${enfants}` : 'Parent';
        return {
          id: p.user_info.id!,
          label: `${p.user_info.prenom ?? ''} ${p.user_info.nom ?? ''} (${suffix})`.trim(),
          linkedIds: parentUserIdToStudentUserIds.get(p.user_info.id!),
        };
      });
    this.recipients.set([...fromTeachers, ...fromParents, ...fromStudents]);
  }

  openCompose() {
    this.composeReceivers.set(new Set());
    this.composeSubject.set('');
    this.composeContent.set('');
    this.recipientSearch.set('');
    this.showCompose.set(true);
  }

  closeCompose() {
    this.showCompose.set(false);
  }

  isRecipientChecked(id: number): boolean {
    return this.composeReceivers().has(id);
  }

  /** Coche/décoche un destinataire. Cocher ajoute aussi automatiquement ses
   * destinataires liés (le parent d'un élève, ou l'inverse) — un décochage
   * reste volontaire, on ne décoche jamais rien à la place de l'utilisateur. */
  toggleRecipient(recipient: MessageRecipient) {
    const next = new Set(this.composeReceivers());
    if (next.has(recipient.id)) {
      next.delete(recipient.id);
    } else {
      next.add(recipient.id);
      for (const linkedId of recipient.linkedIds ?? []) {
        next.add(linkedId);
      }
    }
    this.composeReceivers.set(next);
  }

  selectAllRecipients() {
    this.composeReceivers.set(new Set(this.recipients().map(r => r.id)));
  }

  deselectAllRecipients() {
    this.composeReceivers.set(new Set());
  }

  async submitCompose() {
    const receivers = Array.from(this.composeReceivers());
    if (!receivers.length || !this.composeSubject().trim() || !this.composeContent().trim()) return;
    this.sending.set(true);
    const subject = this.composeSubject().trim();
    const content = this.composeContent().trim();
    const results = await Promise.all(receivers.map(id => this.messagingService.send(id, subject, content)));
    this.sending.set(false);
    if (results.some(Boolean)) {
      this.showCompose.set(false);
      await this.loadMessages();
    }
  }

  openMessage(m: Message) {
    this.selectedMessage.set(m);
    if (m.receiver === this.currentUser()?.id && !m.read && m.id) {
      this.messagingService.markRead(m.id);
    }
  }

  closeMessage() {
    this.selectedMessage.set(null);
  }

  async deleteMessage(id: number | undefined) {
    if (!id) return;
    await this.messagingService.delete(id);
    this.selectedMessage.set(null);
  }

  otherPartyLabel(m: Message): string {
    const isReceived = m.receiver === this.currentUser()?.id;
    const info = isReceived ? m.sender_info : m.receiver_info;
    if (!info) return isReceived ? 'Expéditeur inconnu' : 'Destinataire inconnu';
    return `${info.prenom ?? ''} ${info.nom ?? ''}`.trim() || info.username || 'Utilisateur';
  }

  async onRefresh(event: any) {
    try {
      await this.loadMessages();
    } finally {
      event.target.complete();
    }
  }
}
