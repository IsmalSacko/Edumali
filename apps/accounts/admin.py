from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Student, Parent, Teacher


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Informations personnelles', {'fields': ('first_name', 'last_name', 'email', 'role', 'phone_number', 'profile_photo', 'address')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates importantes', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'role', 'email')
        }),
    )
    list_display = ('username', 'first_name', 'last_name', 'email', 'phone_number', 'is_staff', 'role')
    list_filter = ('role', 'is_staff',)
    search_fields = ('username', 'first_name', 'last_name', 'email', 'phone_number')
    ordering = ('username',)

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'date_of_birth', 'gender', 'status')
    list_filter = ('gender', 'status')
    search_fields = ('user__username', 'user__first_name', 'user__last_name')
    ordering = ('user__username',)

@admin.register(Parent)
class ParentAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_user', 'get_nom', 'get_prenom', 'get_phone_number', 'get_address')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'phone_number')
    filter_horizontal = ('enfants',)  # permet sélection multiples enfants
    ordering = ('user__username',)
    def get_user(self, obj):
        return obj.user.username
    def get_nom(self, obj):
        return obj.user.last_name
    def get_prenom(self, obj):
        return obj.user.first_name
    def get_phone_number(self, obj):
        return obj.user.phone_number
    def get_address(self, obj):
        return obj.user.address
    get_nom.short_description = 'Nom'
    get_prenom.short_description = 'Prénom'
    get_phone_number.short_description = 'Numéro de téléphone'
    get_address.short_description = 'Adresse'
    get_user.short_description = 'Utilisateur'

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_user','get_prenom', 'get_nom', 'get_specialty')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'specialty')
    ordering = ('user__username',)
    def get_prenom(self, obj):
        return obj.user.first_name
    def get_nom(self, obj):
        return obj.user.last_name
    def get_specialty(self, obj):
        return obj.specialty
    def get_user(self, obj):
        return obj.user.username
    get_prenom.short_description = 'Prénom'
    get_nom.short_description = 'Nom'
    get_specialty.short_description = 'Spécialité'
    get_user.short_description = 'Utilisateur'