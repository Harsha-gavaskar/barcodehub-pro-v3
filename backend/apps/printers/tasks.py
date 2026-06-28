from celery import shared_task
from django.utils import timezone
import logging
logger = logging.getLogger(__name__)

@shared_task
def process_print_job(job_id: str):
    from .models import PrintJob
    try:
        job = PrintJob.objects.get(id=job_id)
        job.status = 'printing'
        job.started_at = timezone.now()
        job.save(update_fields=['status','started_at'])
        import time
        time.sleep(2)  # Simulate print processing
        job.status = 'done'
        job.completed_at = timezone.now()
        job.save(update_fields=['status','completed_at'])
        logger.info(f'Print job {job_id} completed')
    except PrintJob.DoesNotExist:
        logger.error(f'Print job {job_id} not found')
    except Exception as e:
        logger.error(f'Print job {job_id} failed: {e}')
        try:
            job = PrintJob.objects.get(id=job_id)
            job.status = 'failed'
            job.error_message = str(e)
            job.save(update_fields=['status','error_message'])
        except Exception:
            pass

@shared_task
def cleanup_old_jobs():
    from .models import PrintJob
    from datetime import timedelta
    cutoff = timezone.now() - timedelta(days=30)
    deleted, _ = PrintJob.objects.filter(status__in=('done','cancelled'), created_at__lt=cutoff).delete()
    logger.info(f'Cleaned up {deleted} old print jobs')
