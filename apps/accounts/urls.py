
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ParentViewSet, TeacherViewSet, StudentViewSet

router = DefaultRouter()
router.register('teachers', TeacherViewSet, basename='teachers')
router.register('students', StudentViewSet, basename='students')
router.register('parents', ParentViewSet, basename='parents')


urlpatterns = [
    path('', include(router.urls)),
    
]