from django.db.models import Count, Avg, F, FloatField, ExpressionWrapper
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

from apps.accounts.models import Student, Teacher, Parent
from apps.classes.models import Classe, Matiere
# Utilise le modèle Evaluation exact de ton app (ici : apps.grades.models.Evaluation)
from apps.dashboard.models import ActionLog, Alert
from apps.grades.models import Evaluation

from .serializers import DashboardStatsSerializer, AlertSerializer, ProfileSchoolSerializer, ActionLogSerializer

class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    # cache léger (60s) — retire si tu veux données toujours fraîches
    @method_decorator(cache_page(60))
    def get(self, request):
        # Totaux simples
        total_students = Student.objects.count()
        total_teachers = Teacher.objects.count()
        total_parents = Parent.objects.count()
        total_classes = Classe.objects.count()
        total_matieres = Matiere.objects.count()

        # Moyenne générale — normalisation (score/max_score)*20, exclude invalid max_score
        avg_expr = ExpressionWrapper(
            (F('score') * 1.0) / F('max_score') * 20.0,
            output_field=FloatField()
        )
        avg_qs = Evaluation.objects.exclude(max_score__lte=0)
        moyenne_generale = avg_qs.aggregate(avg=Avg(avg_expr))['avg'] or 0.0
        moyenne_generale = round(moyenne_generale, 2)

        # Répartition élèves par cycle — compte d'élèves distincts liés à des classes/ matières du cycle
        # On suppose : Student <-- M2M Classe (Classe.eleves) et Classe.matieres (Matiere.cycle)
        students_primaire = Student.objects.filter(classes__matieres__cycle='primaire').distinct().count()
        students_secondaire = Student.objects.filter(classes__matieres__cycle='secondaire').distinct().count()
        students_lycee = Student.objects.filter(classes__matieres__cycle='lycee').distinct().count()

        students_by_cycle = {
            'primaire': students_primaire,
            'secondaire': students_secondaire,
            'lycee': students_lycee,
        }

        payload = {
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_parents": total_parents,
            "total_classes": total_classes,
            "total_matieres": total_matieres,
            "moyenne_generale": moyenne_generale,
            "students_by_cycle": students_by_cycle,
        }

        serializer = DashboardStatsSerializer(payload)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [AllowAny]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete']  # CRUD complet


# vues pour SchoolProfile

class SchoolProfileViewSet(viewsets.ModelViewSet):
    from apps.dashboard.models import SchoolProfile
    queryset = SchoolProfile.objects.all()
    serializer_class = ProfileSchoolSerializer
    permission_classes = [AllowAny]
    http_method_names = ['get', 'post', 'put', 'patch']  # CRUD sauf delete

class ActionLogViewSet(viewsets.ModelViewSet):
    queryset = ActionLog.objects.all().order_by('-timestamp')
    serializer_class = ActionLogSerializer
    permission_classes = [AllowAny]
    http_method_names = ['get','post']  # lecture et création uniquement