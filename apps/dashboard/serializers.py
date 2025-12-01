from rest_framework import serializers

from apps.dashboard.models import Alert, SchoolProfile, ActionLog

class DashboardStatsSerializer(serializers.Serializer):
    total_students = serializers.IntegerField()
    total_teachers = serializers.IntegerField()
    total_parents = serializers.IntegerField()
    total_classes = serializers.IntegerField()
    total_matieres = serializers.IntegerField()
    moyenne_generale = serializers.FloatField()
    students_by_cycle = serializers.DictField(child=serializers.IntegerField(), required=False)
    evaluations_by_trimester = serializers.DictField(child=serializers.IntegerField(), required=False)


class AlertSerializer(serializers.ModelSerializer):

    class Meta: 
        model = Alert
        fields = ['id', 'name','description','active']
        read_only_fields = ['id', 'created_at']

class ProfileSchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolProfile
        fields = ['id', 'name', 'logo', 'cachet', 'directeur', 'signature_directeur']
        read_only_fields = ['id']

        
class ActionLogSerializer(serializers.ModelSerializer):
    user_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ActionLog
        fields = ['id', 'user', 'user_info', 'action', 'timestamp', 'description']
        read_only_fields = ['id', 'user_info', 'timestamp']

    def get_user_info(self, obj):
        if obj.user:
            return {
                "id": obj.user.id,
                "username": obj.user.username,
                "first_name": obj.user.first_name,
                "last_name": obj.user.last_name,
            }
        return None