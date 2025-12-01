from django.contrib import admin

from .models import Payment
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display= ('id', 'get_student', 'comptable', 'get_amount', 'get_type_payment', 'get_method', 'get_paid_at', 'get_status', 'get_receipt_number')
    list_filter = ('type_payment', 'method', 'status', 'paid_at')
    search_fields = ('student__user__username', 'comptable__user__username', 'receipt_number')  
    ordering = ('-paid_at',)
    readonly_fields = ('receipt_number',)  
   
    def comptable(self, obj):
         return obj.comptable.user.first_name + ' ' + obj.comptable.user.last_name if obj.comptable else ''
    comptable.short_description = 'Comptable' 

    def get_student(self, obj):
         return obj.student.user.get_full_name() or obj.student.user.username
    get_student.short_description = 'Étudiant' 

    def get_amount(self, obj):
         return obj.amount
    get_amount.short_description = 'Montant'

    def get_type_payment(self, obj):
         return obj.get_type_payment_display()
    get_type_payment.short_description = 'Type de paiement'

    def get_method(self, obj):
         return obj.get_method_display()
    get_method.short_description = 'Méthode de paiement'

    def get_status(self, obj):
         return obj.get_status_display()
    get_status.short_description = 'Statut'

    def get_paid_at(self, obj):
         return obj.paid_at.strftime('%d/%m/%Y %H:%M')
    get_paid_at.short_description = 'Date de paiement'

    def get_receipt_number(self, obj):
         return obj.receipt_number
    get_receipt_number.short_description = 'Numéro de reçu'
  
    
   
