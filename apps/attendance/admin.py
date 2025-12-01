from django.contrib import admin

# Register your models here.
from .models import Attendance

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('id','get_student', 'get_date', 'get_status', 'get_remark')
    search_fields = ('student__first_name', 'student__last_name', 'date', 'status')
    list_filter = ('status', 'date')

    def get_student(self, obj):
        return f"{obj.student.user.first_name} {obj.student.user.last_name}"
    
    def get_date(sel, obj):
        # date format jj/mm/aaaa
        return f"{obj.date.strftime('%d/%m/%Y')}"
    def get_status(self, obj):
        return f"{obj.status}"
    def get_remark(self, obj):
        return f"{obj.remark}"
    get_student.short_description = 'Étudiant'
    get_date.short_description = 'Date'
    get_status.short_description = 'Statut'
    get_remark.short_description = 'Remarque'