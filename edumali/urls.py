from django.contrib import admin
from django.urls import path, include, re_path

from apps.accounts.views import UserMeView
from edumali import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path("i18n/", include("django.conf.urls.i18n")), 
     path('api/accounts/', include('apps.accounts.urls')),
     re_path(r'^api/auth/', include('djoser.urls')),
     re_path(r'^api/auth/', include('djoser.urls.jwt')),   # JWT endpoints (login/refresh/verify)
    #path('api/auth/', include('djoser.urls.authtoken')),
    path('api/users/me/', UserMeView.as_view(), name='user-me'),
    # path('api/students/', include('apps.students.urls')),
    # path('api/classes/', include('apps.classes.urls')),
    path('api/grades/', include('apps.grades.urls')),
    # path('api/attendance/', include('apps.attendance.urls')),
     path('api/payments/', include('apps.payments.urls')),
    # path('api/messages/', include('apps.messaging.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
]

# Servir les fichiers médias en mode développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
