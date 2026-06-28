import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('barcodehub')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# ── Periodic Tasks ─────────────────────────────────────────────
app.conf.beat_schedule = {
    # Sync Google Sheets every hour
    'sync-google-sheets-hourly': {
        'task': 'apps.google_sheets.tasks.sync_all_sheets',
        'schedule': crontab(minute=0, hour='*'),
    },
    # Check low stock every 30 minutes
    'check-low-stock': {
        'task': 'apps.inventory.tasks.check_low_stock_alerts',
        'schedule': crontab(minute='*/30'),
    },
    # Clean up expired print jobs daily
    'cleanup-print-jobs': {
        'task': 'apps.printers.tasks.cleanup_old_jobs',
        'schedule': crontab(hour=2, minute=0),
    },
    # Generate daily analytics report
    'daily-analytics-snapshot': {
        'task': 'apps.analytics.tasks.create_daily_snapshot',
        'schedule': crontab(hour=23, minute=59),
    },
}

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
