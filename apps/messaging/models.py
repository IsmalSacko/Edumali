from django.db import models
from apps.accounts.models import User

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='received_messages')
    subject = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    is_group = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.subject} - {self.sender} → {self.receiver}"
