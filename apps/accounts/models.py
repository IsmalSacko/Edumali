from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('parent', 'Parent'),
        ('student', 'Student'),
        ('surveillant', 'Surveillant'),
        ('comptable', 'Comptable')

    )
    # augmenter max_length pour contenir les valeurs les plus longues (ex: 'surveillant')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    profile_photo = models.ImageField(upload_to='profiles/', blank=True, null=True)
    address = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['username']


class Student(models.Model):
    #user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role':'student'})
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=[('M','Masculin'), ('F','Féminin')], blank=True)
    status = models.CharField(max_length=20, default='actif')  # actif / exclu / transféré

    # Méthode à ajouter au modèle Student pour calculer la moyenne pondérée
    def average_for_trimester(self, trimester, cycle=None):
        """
        Retourne la moyenne pondérée d'un élève pour un trimestre donné.

        Algorithme recommandé :
        - Pour chaque matière, calculer la moyenne de la matière en combinant
          les évaluations existantes (par ex. 'CC' et 'EX') en utilisant les
          poids d'évaluation (par défaut CC=0.4, EX=0.6).
          subject_avg = sum(note * eval_weight) / sum(eval_weight)
        - Puis calculer la moyenne générale du trimestre en pondérant chaque
          matière par son `coefficient` :
          trimester_avg = sum(subject_avg * coef) / sum(coef)

        Ce schéma évite de multiplier deux fois le coefficient et gère le cas
        où une matière n'a qu'un seul type d'évaluation.
        """
        from collections import defaultdict

        grades = self.grade_set.filter(trimester=trimester)
        if cycle:
            grades = grades.filter(cycle=cycle)

        # regrouper par matière
        groups = defaultdict(list)
        for g in grades.select_related('matiere'):
            if g.matiere is None:
                continue
            groups[g.matiere.id].append(g)

        total = 0.0
        total_coef = 0.0

        for matiere_id, g_list in groups.items():
            # récupérer coefficient depuis l'objet matiere
            coef = getattr(g_list[0].matiere, 'coefficient', 1) or 1

            # calculer moyenne de la matière en tenant compte des poids d'éval
            num = 0.0
            den = 0.0
            for g in g_list:
                w = 0.4 if getattr(g, 'type_eval', '') == 'CC' else 0.6
                num += (g.note or 0.0) * w
                den += w

            if den == 0:
                continue

            subject_avg = num / den
            total += subject_avg * coef
            total_coef += coef

        if total_coef == 0:
            return 0
        return round(total / total_coef, 2)

    def average_for_matiere(self, matiere, trimester=None, cycle=None):
        """
        Retourne la moyenne d'un élève pour une matière donnée.

        - Si `trimester` est fourni, on limite aux évaluations de ce trimestre.
        - On combine les évaluations (CC/EX) selon leurs poids et retourne
          la moyenne (sans appliquer le coefficient de la matière).
        """
        qs = self.grade_set.filter(matiere=matiere)
        if trimester is not None:
            qs = qs.filter(trimester=trimester)
        if cycle:
            qs = qs.filter(cycle=cycle)

        num = 0.0
        den = 0.0
        for g in qs:
            w = 0.4 if getattr(g, 'type_eval', '') == 'CC' else 0.6
            num += (g.note or 0.0) * w
            den += w

        if den == 0:
            return None
        return round(num / den, 2)

    def average_for_year(self, cycle=None):
        """
        Retourne la moyenne annuelle pour un élève (regroupe toutes les
        évaluations de l'année scolaire). On calcule la moyenne par matière
        (en combinant évaluations par poids) puis on pondère par coefficient.
        """
        from collections import defaultdict

        qs = self.grade_set.all()
        if cycle:
            qs = qs.filter(cycle=cycle)

        groups = defaultdict(list)
        for g in qs.select_related('matiere'):
            if g.matiere is None:
                continue
            groups[g.matiere.id].append(g)

        total = 0.0
        total_coef = 0.0
        for g_list in groups.values():
            coef = getattr(g_list[0].matiere, 'coefficient', 1) or 1
            num = 0.0
            den = 0.0
            for g in g_list:
                w = 0.4 if getattr(g, 'type_eval', '') == 'CC' else 0.6
                num += (g.note or 0.0) * w
                den += w
            if den == 0:
                continue
            subject_avg = num / den
            total += subject_avg * coef
            total_coef += coef

        if total_coef == 0:
            return 0
        return round(total / total_coef, 2)
    def __str__(self):
        return f"{self.user.get_full_name()} (Student)"

    class Meta:
        verbose_name = "Student"
        verbose_name_plural = "Students"
        ordering = ['user__username']


class Parent(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    address = models.CharField(max_length=255, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    enfants = models.ManyToManyField(Student, related_name="parents", blank=True)

    def __str__(self):
        return f"{self.user.get_full_name()} (Parent)"

    class Meta:
        verbose_name = "Parent"
        verbose_name_plural = "Parents"
        ordering = ['user__username']


class Teacher(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    specialty = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} (Teacher)"

    class Meta:
        verbose_name = "Teacher"
        verbose_name_plural = "Teachers"
        ordering = ['user__username']



class Surveillant(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    zone_de_surveillance = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Surveillant"
        verbose_name_plural = "Surveillants"
        permissions = [
            ("can_supervise", "Peut superviser présences et incidents"),
        ]

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class Comptable(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Comptable"
        verbose_name_plural = "Comptables"
        permissions = [
            ("can_manage_payments", "Peut gérer paiements et factures"),
        ]

    def __str__(self):
        return self.user.get_full_name() or self.user.username