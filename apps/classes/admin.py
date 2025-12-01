from django.contrib import admin
from django.db.models import Q

from apps.accounts.models import Student

# Register your models here. EmploiDuTemps, Matiere, Classe
from .models import EmploiDuTemps, Matiere, Classe

@admin.register(EmploiDuTemps)
class EmploiDuTempsAdmin(admin.ModelAdmin):
    list_display = ['classe', 'jour_semaine', 'heure_debut', 'heure_fin', 'matiere', 'enseignant']
    list_filter = ['jour_semaine', 'classe', 'matiere', 'enseignant']
    search_fields = ['classe__nom', 'matiere__nom', 'enseignant__user__first_name', 'enseignant__user__last_name']
    ordering = ['classe', 'jour_semaine', 'heure_debut']
@admin.register(Matiere)
class MatiereAdmin(admin.ModelAdmin):
    list_display = ['nom', 'cycle', 'coefficient']
    list_filter = ['cycle']
    search_fields = ['nom']
    ordering = ['nom']
@admin.register(Classe)
class ClasseAdmin(admin.ModelAdmin):
    list_display = ['nom', 'annee', 'get_enseignants', 'get_eleves', 'get_matieres']
    list_filter = ['annee', 'nom', 'enseignants', 'matieres']

    def get_enseignants(self, obj):
        return ", ".join([str(teacher) for teacher in obj.enseignants.all()])
    get_enseignants.short_description = 'Enseignants'

    def get_eleves(self, obj):
        return ", ".join([str(student) for student in obj.eleves.all()])
    get_eleves.short_description = 'Élèves'

    def get_matieres(self, obj):
        return ", ".join([str(matiere) for matiere in obj.matieres.all()])
    get_matieres.short_description = 'Matières'

    def formfield_for_manytomany(self, db_field, request, **kwargs):
            if db_field.name == 'eleves':
                # On récupère l'ID de l'objet en cours de modification depuis l'URL
                obj_id = request.resolver_match.kwargs.get('object_id')
                if obj_id:
                    # Edition : garder les élèves libres ou déjà dans cette classe
                    kwargs["queryset"] = Student.objects.filter(
                        Q(classes__isnull=True) | Q(classes__id=obj_id)
                    )
                else:
                    # Création : seulement les élèves libres
                    kwargs["queryset"] = Student.objects.filter(classes__isnull=True)
            return super().formfield_for_manytomany(db_field, request, **kwargs)