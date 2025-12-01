from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    student_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'student', 
            'student_info',
            'amount',
            'method',
            'type_payment',
            'paid_at',
            'status',
            'receipt_number',
        ]
        read_only_fields = ['id', 'student_info', 'paid_at', 'receipt_number']

    def get_student_info(self, obj):
        student = obj.student
        return {
            'id': student.id,
            'full_name': f"{student.user.first_name} {student.user.last_name}",
            'email': student.user.email,
        }