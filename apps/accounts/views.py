from rest_framework import viewsets
from rest_framework import generics, serializers
from rest_framework.authentication import SessionAuthentication
from .models import Parent, Teacher, Student, User
from ..accounts.serializers import ParentSerializer, TeacherSerializer, StudentSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

class ParentViewSet(viewsets.ModelViewSet):
    queryset = Parent.objects.all()
    serializer_class = ParentSerializer
    permission_classes = [IsAdminUser]



class _UserMeSerializer(serializers.ModelSerializer):
    profile_photo = serializers.SerializerMethodField()

    def get_profile_photo(self, obj):
        return obj.profile_photo.url if obj.profile_photo else None

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "role",
            "phone_number",
            "profile_photo",
        )
        read_only_fields = ("id", "username", "role")


class UserMeView(generics.RetrieveUpdateAPIView):
    """GET / PATCH pour l'utilisateur courant.

    - GET: retourne les champs publics de l'utilisateur.
    - PATCH: modification partielle (first_name, last_name, phone_number, email).
    """
    serializer_class = _UserMeSerializer
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user