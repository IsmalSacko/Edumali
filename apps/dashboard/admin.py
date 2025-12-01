from django.contrib import admin

# Register your models here.dashboard
from .models import Alert, SchoolProfile, ActionLog

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_name', 'get_description', 'created_at', 'active')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)

    def get_description(self, obj):
        return (obj.description[:75] + '...') if len(obj.description) > 75 else obj.description
    def get_name(self, obj):
        return obj.name
    get_description.short_description = 'Description'
    get_name.short_description = 'Nom'
admin.site.register(SchoolProfile)
admin.site.register(ActionLog)