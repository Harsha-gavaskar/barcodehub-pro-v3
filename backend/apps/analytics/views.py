from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils import timezone
from datetime import timedelta
from django.db import models
from django.db.models import Sum, Count
from .models import DailyPrintSnapshot
from apps.products.models import Product
from apps.printers.models import PrintJob
from apps.barcodes.models import Barcode

class AnalyticsDashboardView(APIView):
    """GET /api/analytics/dashboard/ — System dashboard counts and chart stats"""
    def get(self, request):
        company = request.user.company
        if not company:
            return Response({'error': 'User has no associated company'}, status=400)
            
        # Overall Counts
        total_products = Product.objects.filter(company=company).count()
        total_printed = PrintJob.objects.filter(printer__company=company, status='done').aggregate(s=Sum('quantity'))['s'] or 0
        pending_prints = PrintJob.objects.filter(printer__company=company, status='queued').count()
        
        # Stock KPIs
        low_stock_count = Product.objects.filter(company=company, stock__gt=0, stock__lte=models.F('low_stock_threshold')).count()
        out_of_stock_count = Product.objects.filter(company=company, stock=0).count()
        
        # Daily Chart Data (last 30 days)
        today = timezone.now().date()
        start_date = today - timedelta(days=29)
        snapshots = DailyPrintSnapshot.objects.filter(company=company, date__range=[start_date, today])
        
        chart_data = []
        # Prepopulate all 30 days
        snapshot_dict = {snap.date: snap for snap in snapshots}
        for i in range(30):
            d = start_date + timedelta(days=i)
            snap = snapshot_dict.get(d)
            chart_data.append({
                'date': d.strftime('%b %d'),
                'generated': snap.generated_count if snap else 0,
                'printed': snap.printed_count if snap else 0,
                'failed': snap.failed_count if snap else 0,
            })
            
        # Top Products by Print Count
        top_products_raw = PrintJob.objects.filter(printer__company=company, status='done') \
            .values('title') \
            .annotate(count=Sum('quantity')) \
            .order_by('-count')[:5]
            
        top_products = [{'name': item['title'], 'count': item['count']} for item in top_products_raw]
        
        # Barcode Types distribution
        barcode_dist = list(Barcode.objects.filter(generated_by__company=company) \
            .values('format') \
            .annotate(value=Count('id')) \
            .order_by('-value'))
            
        return Response({
            'kpis': {
                'totalProducts': total_products,
                'totalPrinted': total_printed,
                'pendingPrints': pending_prints,
                'lowStock': low_stock_count,
                'outOfStock': out_of_stock_count,
            },
            'chartData': chart_data,
            'topProducts': top_products,
            'barcodeDistribution': barcode_dist,
        })
