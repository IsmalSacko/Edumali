from django.db import models
from apps.accounts.models import Teacher, Student

# -------------------------
# Matières
# -------------------------
class Matiere(models.Model):
    CYCLE_CHOICES = [
        ('primaire', 'Primaire 1-6'),
        ('secondaire', 'Secondaire 7-9'),
        ('lycee', 'Lycée 10-12'),
    ]

    nom = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    cycle = models.CharField(max_length=20, choices=CYCLE_CHOICES, default='primaire')
    coefficient = models.PositiveIntegerField(default=1)  # coefficient par défaut

    class Meta:
        verbose_name = "Matière"
        verbose_name_plural = "Matières"
        ordering = ['nom']

    def __str__(self):
        return f"{self.nom} ({self.get_cycle_display()})"


# -------------------------
# Classes
# -------------------------
class Classe(models.Model):
    LEVEL_CHOICES = [(i, f"Année {i}") for i in range(1, 13)]

    nom = models.CharField(max_length=50)
    annee = models.IntegerField(choices=LEVEL_CHOICES)
    enseignants = models.ManyToManyField(Teacher, blank=True, related_name='classes')
    matieres = models.ManyToManyField(Matiere, blank=True, related_name='classes')
    eleves = models.ManyToManyField(Student, blank=True, related_name='classes')

    class Meta:
        verbose_name = "Classe"
        verbose_name_plural = "Classes"
        ordering = ['annee', 'nom']

    def __str__(self):
        return f"{self.nom} (Année {self.annee})"


# -------------------------
# Emploi du temps
# -------------------------
class EmploiDuTemps(models.Model):
    JOUR_CHOICES = [
        (1, "Lundi"),
        (2, "Mardi"),
        (3, "Mercredi"),
        (4, "Jeudi"),
        (5, "Vendredi"),
        (6, "Samedi"),
    ]

    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name='emplois_du_temps')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE)
    enseignant = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='emplois_du_temps')

    jour_semaine = models.IntegerField(choices=JOUR_CHOICES)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()

    class Meta:
        verbose_name = "Emploi du temps"
        verbose_name_plural = "Emplois du temps"
        ordering = ['classe', 'jour_semaine', 'heure_debut']
        unique_together = ('classe', 'matiere', 'jour_semaine', 'heure_debut')

    def __str__(self):
        return f"{self.classe} - {self.matiere} - {self.get_jour_semaine_display()} ({self.heure_debut}-{self.heure_fin})"
