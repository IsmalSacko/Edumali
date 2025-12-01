from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ActionLogViewSet, AlertViewSet, DashboardStatsAPIView, SchoolProfileViewSet

router = DefaultRouter()
router.register(r'alerts', AlertViewSet, basename='alert')
router.register(r'school-profiles', SchoolProfileViewSet, basename='schoolprofile')
router.register(r'action-logs', ActionLogViewSet, basename='actionlog')

urlpatterns = [
    path('stats/', DashboardStatsAPIView.as_view(), name='dashboard-stats'),
]

urlpatterns += router.urls