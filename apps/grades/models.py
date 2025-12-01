from django.db import models
from apps.accounts.models import Student, Teacher
from apps.classes.models import Matiere

class Evaluation(models.Model):
    """
    Une évaluation individuelle (ex : CC1, devoir, TP, examen, rattrapage).
    On stocke le score et le max_score pour normaliser proprement sur 20.
    Plusieurs évaluations du même type par élève/matière/trimestre sont autorisées.
    """
    EVAL_TYPE_CHOICES = [
        ('CC', 'Contrôle Continu'),
        ('EX', 'Examen'),
        ('TP', 'Travail Pratique'),
        ('DS', 'Devoir Surveillé'),
        ('RA', 'Rattrapage'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='evaluations')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name='evaluations')
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='evaluations')

    eval_type = models.CharField(max_length=3, choices=EVAL_TYPE_CHOICES, default='CC')
    score = models.FloatField(help_text="Points obtenus (ex: 14)")
    max_score = models.FloatField(default=20.0, help_text="Points maximum de l'évaluation (ex: 20, 10, 50)")
    date = models.DateField(null=True, blank=True)
    trimester = models.IntegerField(choices=[(1, '1er trimestre'), (2, '2ème trimestre'), (3, '3ème trimestre')])
    cycle = models.CharField(max_length=20, choices=[
        ('primaire', 'Primaire 1ère-6ème'),
        ('secondaire', 'Secondaire 7ème-9ème'),
        ('lycee', 'Lycée 10ème-12ème'),
    ], null=True, blank=True)

    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Évaluation"
        verbose_name_plural = "Évaluations"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student} - {self.matiere} - {self.eval_type} ({self.normalized_note():.2f}/20)"

    def normalized_note(self) -> float:
        """
        Normalise la note sur 20.
        Ex : score=8, max_score=10 -> (8/10)*20 = 16.0
        """
        try:
            if not self.max_score or self.max_score == 0:
                return 0.0
            return (self.score / self.max_score) * 20.0
        except Exception:
            return 0.0

    @property
    def note_ponderee(self) -> float:
        """
        Note déjà normalisée et multipliée par le coefficient de la matière
        selon un poids par type (par défaut, CC=0.4, EX=0.6).
        Attention : cette propriété applique un poids par type sur UNE évaluation,
        elle est surtout utile pour afficher la contribution d'une évaluation isolée.
        Pour le calcul final matière -> utiliser les services d'agrégation.
        """
        # Par défaut (ne pas forcer à utiliser ça pour l'agrégation finale)
        coef_eval = 0.4 if self.eval_type == 'CC' else 0.6
        return self.normalized_note() * getattr(self.matiere, "coefficient", 1) * coef_eval
