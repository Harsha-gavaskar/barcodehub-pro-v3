import io
import csv
import logging
import pandas as pd
from django.db.models import Q
from rest_framework import generics, status, filters, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import Product, Category
from .serializers import ProductSerializer, ProductListSerializer, CategorySerializer
from .filters import ProductFilter
from apps.users.views import log_action

logger = logging.getLogger(__name__)


class CategoryViewSet(ModelViewSet):
    """CRUD for product categories"""
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

    def get_queryset(self):
        qs = super().get_queryset().filter(parent__isnull=True)
        if self.request.user.company:
            qs = qs.filter(Q(company=self.request.user.company) | Q(company__isnull=True))
        return qs


class ProductViewSet(ModelViewSet):
    """
    Full CRUD for products with search, filter, sort, pagination.
    GET /api/products/           — List products
    POST /api/products/          — Create product
    GET /api/products/<id>/      — Get product detail
    PUT /api/products/<id>/      — Update product
    PATCH /api/products/<id>/    — Partial update
    DELETE /api/products/<id>/   — Delete product
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'sku', 'barcode', 'manufacturer', 'description']
    ordering_fields = ['name', 'sku', 'price', 'stock', 'created_at', 'updated_at']
    ordering = ['-created_at']
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_queryset(self):
        qs = Product.objects.select_related('category', 'created_by', 'company')
        if self.request.user.company:
            qs = qs.filter(company=self.request.user.company)
        return qs

    def perform_create(self, serializer):
        product = serializer.save()
        log_action(self.request.user, f'Created Product: {product.name}', 'products',
                   str(product.id), request=self.request)

    def perform_update(self, serializer):
        product = serializer.save()
        log_action(self.request.user, f'Updated Product: {product.name}', 'products',
                   str(product.id), request=self.request)

    def perform_destroy(self, instance):
        log_action(self.request.user, f'Deleted Product: {instance.name}', 'products',
                   str(instance.id), request=self.request)
        instance.delete()

    @action(detail=False, methods=['post'], url_path='bulk-import',
            parser_classes=[MultiPartParser, FormParser])
    def bulk_import(self, request):
        """POST /api/products/bulk-import/ — Import from CSV or Excel"""
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        filename = file.name.lower()
        try:
            if filename.endswith('.csv'):
                df = pd.read_csv(file)
            elif filename.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file)
            else:
                return Response({'error': 'Unsupported file format. Use CSV or Excel.'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Normalize column names
            df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

            # Map columns to model fields
            column_map = {
                'product_name': 'name', 'item_name': 'name',
                'product_sku': 'sku', 'item_sku': 'sku',
                'product_price': 'price', 'item_price': 'price',
                'barcode_value': 'barcode', 'barcode_number': 'barcode',
            }
            df.rename(columns=column_map, inplace=True)

            required_cols = {'name', 'sku'}
            missing = required_cols - set(df.columns)
            if missing:
                return Response({'error': f'Missing required columns: {", ".join(missing)}'},
                                status=status.HTTP_400_BAD_REQUEST)

            created_count = 0
            errors = []
            company = request.user.company

            for i, row in df.iterrows():
                try:
                    row_dict = row.where(pd.notna(row), None).to_dict()
                    product_data = {
                        'name': str(row_dict.get('name', '')).strip(),
                        'sku': str(row_dict.get('sku', '')).strip(),
                        'barcode': str(row_dict.get('barcode', row_dict.get('sku', ''))).strip(),
                        'price': row_dict.get('price'),
                        'description': str(row_dict.get('description', '')),
                        'weight': str(row_dict.get('weight', '')),
                        'manufacturer': str(row_dict.get('manufacturer', '')),
                        'stock': int(row_dict.get('stock', 0) or 0),
                        'location': str(row_dict.get('location', '')),
                        'company': company,
                        'created_by': request.user,
                    }
                    Product.objects.update_or_create(
                        sku=product_data['sku'],
                        company=company,
                        defaults={k: v for k, v in product_data.items() if k not in ('sku', 'company')},
                    )
                    created_count += 1
                except Exception as e:
                    errors.append({'row': i + 2, 'error': str(e)})

            log_action(request.user, f'Bulk imported {created_count} products', 'products',
                       request=request)
            return Response({
                'imported': created_count,
                'errors': errors,
                'message': f'Successfully imported {created_count} products',
            })

        except Exception as e:
            logger.error(f'Bulk import error: {e}')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='export-csv')
    def export_csv(self, request):
        """GET /api/products/export-csv/ — Download all products as CSV"""
        products = self.get_queryset()
        response_io = io.StringIO()
        writer = csv.writer(response_io)
        writer.writerow(['Name', 'SKU', 'Barcode', 'Format', 'Price', 'Category',
                         'Stock', 'Location', 'Manufacturer', 'Status'])
        for p in products:
            writer.writerow([
                p.name, p.sku, p.barcode, p.barcode_format, p.price,
                p.category.name if p.category else '',
                p.stock, p.location, p.manufacturer, p.status,
            ])
        from django.http import HttpResponse
        response = HttpResponse(response_io.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="products.csv"'
        return response

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """GET /api/products/stats/ — Product statistics"""
        qs = self.get_queryset()
        from django.db.models import Sum, Count, Avg
        return Response({
            'total': qs.count(),
            'active': qs.filter(status='active').count(),
            'low_stock': qs.filter(stock__gt=0, stock__lte=10).count(),
            'out_of_stock': qs.filter(stock=0).count(),
            'total_stock_value': qs.aggregate(
                val=Sum(models.F('price') * models.F('stock'))
            )['val'],
            'by_category': list(
                qs.values('category__name').annotate(count=Count('id')).order_by('-count')[:10]
            ),
        })
