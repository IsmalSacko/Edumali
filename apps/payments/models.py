from django.conf import settings
from django.db import models
import uuid
from django.db import transaction
from django.utils import timezone
from apps.accounts.models import Student


class ReceiptCounter(models.Model):
    day = models.DateField(unique=True)  # pour compteur par jour
    last = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.day} -> {self.last}"
class Payment(models.Model):
    PAYMENT_TYPE_CHOICES = (
        ('inscription','Inscription'),
        ('mensuality','Mensualité'),
        ('cantine','Cantine'),
        ('transport','Transport')
    )
    METHOD_CHOICES = (
        ('orange','Orange Money'),
        ('moov','Moov Money'),
        ('wave','Wave'),
        ('cash','Cash')
    )
    STATUS_CHOICES = (
        ('paid','Paid'),
        ('pending','Pending')
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    comptable = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, limit_choices_to={'role__in': ['comptable', 'admin']})
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type_payment = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    paid_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    receipt_number = models.CharField(max_length=50, blank=True, null=True, unique=True)


    @staticmethod
    def generate_sequential_receipt():
        
        today = timezone.localdate()
        with transaction.atomic():
            # lock the row for today's counter (create if missing)
            counter, created = ReceiptCounter.objects.select_for_update().get_or_create(day=today)
            counter.last += 1
            counter.save(update_fields=['last'])
            seq = counter.last
        # format: RECYYYYMMDD-003
        return f"REC{today.strftime('%Y%m%d')}-{seq:03d}"
    def save(self, *args, **kwargs):
        if not self.receipt_number:
           self.receipt_number = self.generate_sequential_receipt()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student} - {self.type_payment} - {self.amount}"
    class Meta:
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"
        ordering = ['-paid_at']