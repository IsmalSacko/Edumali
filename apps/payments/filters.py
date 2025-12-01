import django_filters
from django.db.models import Q

from apps.payments.models import Payment

class PaymentFilter(django_filters.FilterSet):
    # Recherche insensible à la casse sur receipt_number
    receipt_number = django_filters.CharFilter(field_name='receipt_number', lookup_expr='icontains', label='Numéro reçu')
    
    # Recherche sur type_payment
    type_payment = django_filters.CharFilter(field_name='type_payment', lookup_expr='icontains', label='Type paiement')
    
    # Sur status 
    status = django_filters.CharFilter(field_name='status', lookup_expr='icontains', label='Statut')

    # par nom étudiant
    student = django_filters.CharFilter(field_name='student__user__first_name', lookup_expr='icontains', label='Nom étudiant')

    # par montant
    amount = django_filters.NumberFilter(field_name='amount', label='Montant')
    
    class Meta:
        model = Payment
        fields = ['amount', 'paid_at', 'student']  # Auto-générés

   
 