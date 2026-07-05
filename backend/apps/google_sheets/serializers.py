from rest_framework import serializers
from .models import SheetSyncConfig

class SheetSyncConfigSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = SheetSyncConfig
        fields = ['id', 'spreadsheet_id', 'sheet_name', 'auto_sync', 'last_sync_status',
                  'last_sync_message', 'last_synced_at', 'company_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'last_sync_status', 'last_sync_message', 'last_synced_at', 'company_name', 'created_at', 'updated_at']
