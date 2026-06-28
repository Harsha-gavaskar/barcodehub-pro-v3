import uuid
from django.db import models
from apps.users.models import Company

class DailyPrintSnapshot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='daily_snapshots')
    date = models.DateField()
    generated_count = models.IntegerField(default=0)
    printed_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'daily_print_snapshots'
        unique_together = ['company', 'date']
        ordering = ['date']
