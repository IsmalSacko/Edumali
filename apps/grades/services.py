from collections import defaultdict
from typing import Dict, Iterable

from django.db.models import QuerySet

from apps.grades.models import Evaluation
from apps.classes.models import Matiere

# Poids par type par défaut (peut être surchargé par matière si besoin)
DEFAULT_TYPE_WEIGHTS = {
    'CC': 0.40,
    'EX': 0.60,
    # tu peux ajouter 'TP', 'DS', 'RA' si tu veux répartir différemment
}

def _group_by_eval_type(evals: Iterable[Evaluation]) -> Dict[str, list]:
    """
    Regroupe une liste d'Evaluation par type d'évaluation.
    Exemple de retour: {'CC': [12.0, 14.0], 'EX': [15.0]}
    """
    grouped = defaultdict(list)
    for e in evals:
        grouped[e.eval_type].append(e.normalized_note())
    return grouped

def average_per_type(evals: Iterable[Evaluation]) -> Dict[str, float]:
    """
    Retourne la moyenne (sur 20) par type d'évaluation parmi une liste d'Evaluation.
    Exemple de retour: {'Contrôle Continu': 13.0, 'Examen': 15.0}
    """
    grouped = _group_by_eval_type(evals)
    averages = {}
    for t, notes in grouped.items():
        if notes:
            averages[t] = sum(notes) / len(notes)
    return averages

def subject_final_note(student, matiere: Matiere, trimester: int, type_weights=None) -> float:
    """
    Calcule la note finale d'une matière pour un élève sur un trimestre (sur 20).
    - Récupère toutes les évaluations de (student, matiere, trimester)
    - Calcule la moyenne interne par type (moyenne des CC par exemple)
    - Applique les poids (CC 0.4, EX 0.6 par défaut)
    """
    if type_weights is None:
        type_weights = DEFAULT_TYPE_WEIGHTS

    queryset = Evaluation.objects.filter(student=student, matiere=matiere, trimester=trimester) 
    if not queryset.exists():
        return 0.0

    type_avgs = average_per_type(queryset)
    final = 0.0
    total_weight = 0.0
    for t, w in type_weights.items(): 
        val = type_avgs.get(t)
        if val is not None:
            final += val * w
            total_weight += w

    # Si les poids fournis ne couvrent pas tous les types présents,
    # on normalise par la somme des poids utilisés pour éviter biaiser.
    if total_weight > 0 and total_weight != 1.0:
        final = final / total_weight  # ramène sur une échelle correcte

    return final

# def trimester_report(student, trimester: int, materias: QuerySet = None, type_weights=None) -> dict:
#     """
#     Retourne un rapport détaillé pour un élève sur un trimestre :
#     - détails par matière : note (sur 20), coefficient, note_ponderee
#     - moyenne_generale (pondérée par coefficients)
#     """
#     if materias is None:
#         materias = Matiere.objects.all()

#     total_pond = 0.0
#     total_coeffs = 0.0
#     details = []

#     for m in materias: # toutes les matières
#         note = subject_final_note(student, m, trimester, type_weights=type_weights)
#         if note == 0:
#             continue  # ignore les matières sans évaluation
#         note_pond = note * getattr(m, 'coefficient', 1)
#         details.append({
#             'matiere_id': m.pk,
#             'matiere_nom': str(m),
#             'note': round(note, 2),
#             'coefficient': getattr(m, 'coefficient', 1),
#             'note_ponderee': round(note_pond, 2),
#         })
#         total_pond += note_pond
#         total_coeffs += getattr(m, 'coefficient', 1)

#     moyenne_generale = (total_pond / total_coeffs) if total_coeffs else 0.0

#     return {
#         'student_id': student.pk,
#         'trimester': trimester,
#         'details': details,
#         'total_coeffs': total_coeffs,
#         'moyenne_generale': round(moyenne_generale, 2)
#     }
def trimester_report(student, trimester: int, materias: QuerySet = None, type_weights=None) -> dict:
    """
    Retourne un rapport détaillé pour un élève sur un trimestre (stratégie mixte) :
    - Affiche toutes les matières
    - Moyenne générale calculée uniquement sur les matières avec note
    """
    if materias is None:
        materias = Matiere.objects.all()

    total_pond = 0.0
    total_coeffs = 0.0
    total_pond_eval = 0.0
    total_coeffs_eval = 0.0
    details = []

    for m in materias:
        note = subject_final_note(student, m, trimester, type_weights=type_weights)
        note_pond = note * getattr(m, 'coefficient', 1)
        
        # Stratégie mixte : note None si pas d'évaluation
        evals_exist = Evaluation.objects.filter(student=student, matiere=m, trimester=trimester).exists()
        note_value = round(note, 2) if evals_exist else None
        note_pond_value = round(note_pond, 2) if evals_exist else 0.0

        details.append({
            'matiere_id': m.pk,
            'matiere_nom': str(m),
            'note': note_value or 'PAS D\'ÉVALUATION POUR CETTE MATIÈRE',
            'coefficient': getattr(m, 'coefficient', 1),
            'note_ponderee': note_pond_value,
        })

        total_pond += note_pond_value
        total_coeffs += getattr(m, 'coefficient', 1)
        if evals_exist:
            total_pond_eval += note_pond_value
            total_coeffs_eval += getattr(m, 'coefficient', 1)

    moyenne_generale = (total_pond_eval / total_coeffs_eval) if total_coeffs_eval else 0.0

    return {
        'student_id': student.pk,
        'trimester': trimester,
        'details': details,
        'total_coeffs': total_coeffs,
        'moyenne_generale': round(moyenne_generale, 2)
 }
