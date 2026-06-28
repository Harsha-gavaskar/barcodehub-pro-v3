from celery import shared_task
from django.utils import timezone
from django.db.models import Sum, Count
from apps.users.models import Company
from apps.printers.models import PrintJob
from apps.barcodes.models import Barcode
from .models import DailyPrintSnapshot
import logging

logger = logging.getLogger(__name__)

@shared_task
def create_daily_snapshot():
    """Build daily print snapshot for all companies for yesterday"""
    yesterday = timezone.now().date() - timezone.timedelta(days=1)
    companies = Company.objects.all()
    
    for company in companies:
        try:
            # Count printed
            printed = PrintJob.objects.filter(
                printer__company=company, 
                status='done',
                completed_at__date=yesterday
            ).aggregate(s=Sum('quantity'))['s'] or 0
            
            # Count failed
            failed = PrintJob.objects.filter(
                printer__company=company, 
                status='failed',
                created_at__date=yesterday
            ).count()
            
            # Count generated barcodes
            generated = Barcode.objects.filter(
                generated_by__company=company,
                created_at__date=yesterday
            ).count()
            
            DailyPrintSnapshot.objects.update_or_create(
                company=company,
                date=yesterday,
                defaults={
                    'generated_count': generated,
                    'printed_count': printed,
                    'failed_count': failed,
                }
            )
        except Exception as e:
            logger.error(f"Error creating snapshot for company {company.id}: {e}")
