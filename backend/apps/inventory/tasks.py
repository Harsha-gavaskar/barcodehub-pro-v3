from celery import shared_task
from django.db import models
from apps.products.models import Product
from apps.notifications.models import Notification
import logging

logger = logging.getLogger(__name__)

@shared_task
def check_low_stock_alerts():
    """Celery task scanning all products and generating notifications for low stock"""
    products = Product.objects.filter(stock__gt=0, stock__lte=models.F('low_stock_threshold')).select_related('company')
    
    # Send alert notification to administrators and managers of that company
    for product in products:
        try:
            company = product.company
            if not company:
                continue
            
            # Find admin/managers of the company
            from apps.users.models import User
            admins = User.objects.filter(company=company, role__in=['admin', 'manager'])
            for admin in admins:
                # Check if notification already exists for today
                from django.utils import timezone
                today = timezone.now().date()
                exists = Notification.objects.filter(
                    user=admin,
                    title__icontains=product.sku,
                    created_at__date=today
                ).exists()
                
                if not exists:
                    Notification.objects.create(
                        user=admin,
                        title=f"Low Stock Alert: {product.sku}",
                        message=f"Product '{product.name}' has low stock levels ({product.stock} units remaining). Please reorder."
                    )
        except Exception as e:
            logger.error(f"Error checking stock alert for {product.id}: {e}")
