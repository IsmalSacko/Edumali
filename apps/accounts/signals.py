# apps/accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from .models import Teacher, User
from apps.accounts.models import Parent, Student


from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from .models import User, Student, Parent, Teacher

@receiver(post_save, sender=User)

def create_user_related_objects(sender, instance, created, **kwargs):
    if not created:
        return

    raw_password = instance.password
    if not instance.has_usable_password():
        instance.set_password(raw_password)
        instance.save(update_fields=["password"])


    # Création des objets liés selon le rôle
    if instance.role == "student" and not hasattr(instance, "student"):
        Student.objects.create(user=instance)

    elif instance.role == "parent" and not hasattr(instance, "parent"):
        Parent.objects.create(user=instance)

    elif instance.role == "teacher" and not hasattr(instance, "teacher"):
        Teacher.objects.create(user=instance)
    elif instance.role in ["comptable", "admin","surveillant"]:
         instance.is_staff = True
         instance.save(update_fields=["is_staff"])
    

    # Admin — accessible directement
    if instance.role == "admin":
        instance.is_staff = True
        instance.is_superuser = True
        instance.save(update_fields=["is_staff", "is_superuser"])

 
