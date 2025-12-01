from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from apps.accounts.models import Student

from .models import Evaluation
from .serializers import EvaluationSerializer
from apps.grades import services  # pour endpoints spécifiques si besoin

class EvaluationViewSet(viewsets.ModelViewSet):
    """
    CRUD sur les évaluations.
    Endpoints additionnels :
      - /evaluations/{pk}/recompute_subject_note/  (exemple d'action custom)
    """
    queryset = Evaluation.objects.all().select_related('student__user', 'teacher__user', 'matiere')
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    # Exemple d'action custom : recalculer la note finale de la matière (sur 20)
    @action(detail=True, methods=['get'], url_path='matiere-final-note')
    def matiere_final_note(self, request, pk=None):
        eval_obj = self.get_object()
        student = eval_obj.student
        matiere = eval_obj.matiere
        trimester = eval_obj.trimester
        note_finale = services.subject_final_note(student, matiere, trimester)
        return Response({
            'student_id': student.pk,
            'matiere_id': matiere.pk,
            'trimester': trimester,
            'note_finale': round(note_finale, 2)
        })

    @action(detail=False, methods=['get'], url_path='bulletin/(?P<student_id>[^/.]+)/(?P<trimester>[0-3])')
    def bulletin(self, request, student_id=None, trimester=None):
        try:
            trimester = int(trimester)
        except (TypeError, ValueError):
            return Response({'detail': 'trimester invalide'}, status=status.HTTP_400_BAD_REQUEST)
        
        #  Récupérer l'objet Student
        try:
            student = Student.objects.get(pk=int(student_id))
        except Student.DoesNotExist:
            return Response({'detail': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)
        
        report = services.trimester_report(student=student, trimester=trimester)
        return Response(report)
