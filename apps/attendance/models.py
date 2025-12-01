from django.db import models
from apps.accounts.models import Student

class Attendance(models.Model):
    STATUS_CHOICES = (
        ('present','Present'),
        ('absent','Absent'),
        ('justified','Justified')
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')
    remark = models.TextField(blank=True, null=True) # commentaire ou justification et peut être vide

    class Meta:
        unique_together = ('student', 'date')

    def __str__(self):
        return f"{self.student} - {self.date} - {self.status}"
    class Meta: 
        verbose_name = "Attendance"
        verbose_name_plural = "Attendances"
        ordering = ['-date']