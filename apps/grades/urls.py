from rest_framework.routers import DefaultRouter
from .views import EvaluationViewSet

router = DefaultRouter()
# On enregistre le viewset à la racine du routeur. 
# Comme tu inclus ce fichier sous 'api/grades/' dans le urls.py principal,
# les routes seront : /api/grades/evaluations/, /api/grades/evaluations/<id>/, /api/grades/evaluations/bulletin/<student>/<trimester>/, etc.
router.register(r'evaluations', EvaluationViewSet, basename='evaluations')

urlpatterns = router.urls