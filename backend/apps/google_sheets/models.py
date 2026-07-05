import uuid
from django.db import models
from apps.users.models import Company, User

class SheetSyncConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='sheets_config')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='sheets_configs')
    
    spreadsheet_id = models.CharField(max_length=255)
    sheet_name = models.CharField(max_length=100, default='Products')
    
    auto_sync = models.BooleanField(default=True)
    last_sync_status = models.CharField(max_length=20, default='never')  # success, failed, running
    last_sync_message = models.TextField(blank=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sheet_sync_configs'

    def __str__(self):
        return f"{self.company.name} - {self.spreadsheet_id}"
