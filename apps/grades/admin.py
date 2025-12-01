# apps/grades/admin.py
from django.contrib import admin
from .models import Evaluation

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'student',
        'matiere',
        'score',
        'max_score',
        'eval_type',
        'trimester',
        'cycle',
        'teacher',
        'created_at'
    )
    list_filter = ('trimester', 'cycle', 'eval_type', 'matiere')
    search_fields = (
        'student__user__first_name',
        'student__user__last_name',
        'student__user__username',
        'matiere__nom',
    )
    ordering = ('-created_at',)
