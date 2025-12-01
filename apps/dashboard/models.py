from django.db import models

from apps.accounts.models import User

class Alert(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

#  Profile de l'école
class SchoolProfile(models.Model):
    name = models.CharField(max_length=255, default="Nom de l'école")
    logo = models.ImageField(upload_to='school/logo/', blank=True, null=True)
    cachet = models.ImageField(upload_to='school/cachet/', blank=True, null=True)
    directeur = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'role':'admin'})
    signature_directeur = models.ImageField(upload_to='school/signatures/', blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Profil de l'école"
        verbose_name_plural = "Profils des écoles"

class ActionLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user} → {self.action} ({self.timestamp})"
    class Meta: 
        verbose_name = "Journal d'action"
        verbose_name_plural = "Journaux d'actions"
        ordering = ['-timestamp']
