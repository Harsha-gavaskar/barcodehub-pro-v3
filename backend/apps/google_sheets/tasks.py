from celery import shared_task
from .models import SheetSyncConfig
from .services import GoogleSheetsService
import logging

logger = logging.getLogger(__name__)

@shared_task
def sync_company_sheet(config_id: str):
    """Sync single company sheet configuration in background"""
    try:
        config = SheetSyncConfig.objects.get(id=config_id)
        config.last_sync_status = 'running'
        config.save(update_fields=['last_sync_status'])
        
        result = GoogleSheetsService.sync_sheet(config)
        logger.info(f"Sync complete for config {config_id}: {result}")
    except SheetSyncConfig.DoesNotExist:
        logger.error(f"Sync config {config_id} not found")

@shared_task
def sync_all_sheets():
    """Trigger sync for all auto-sync enabled sheets (called hourly by Celery Beat)"""
    configs = SheetSyncConfig.objects.filter(auto_sync=True)
    for c in configs:
        sync_company_sheet.delay(str(c.id))
