from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Barcode
from .serializers import BarcodeSerializer, GenerateBarcodeSerializer, BatchBarcodeSerializer
from .services import BarcodeService
from apps.users.views import log_action

class GenerateBarcodeView(APIView):
    """POST /api/barcodes/generate/ — Generate barcode (SVG + PNG)"""
    def post(self, request):
        serializer = GenerateBarcodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        result = BarcodeService.generate_barcode(
            value=data['value'],
            fmt=data['format'],
            width=data['width'],
            height=data['height'],
        )
        if 'error' in result:
            return Response({'error': result['error']}, status=status.HTTP_400_BAD_REQUEST)
        if data.get('save'):
            barcode = Barcode.objects.create(
                value=data['value'],
                format=data['format'],
                svg_data=result.get('svg', ''),
                generated_by=request.user,
                width=data['width'],
                height=data['height'],
                display_value=data['display_value'],
                background_color=data['background_color'],
                foreground_color=data['foreground_color'],
                label=data.get('label', ''),
            )
            result['id'] = str(barcode.id)
        log_action(request.user, f'Generated {data["format"]} barcode', 'barcodes', request=request)
        return Response(result)

class BatchGenerateView(APIView):
    """POST /api/barcodes/batch/ — Generate multiple barcodes"""
    def post(self, request):
        serializer = BatchBarcodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        results = BarcodeService.generate_batch(data['items'], data['format'])
        log_action(request.user, f'Batch generated {len(results)} barcodes', 'barcodes', request=request)
        return Response({'results': results, 'count': len(results)})

class BarcodeHistoryView(generics.ListAPIView):
    """GET /api/barcodes/history/ — Barcode generation history"""
    serializer_class = BarcodeSerializer
    def get_queryset(self):
        return Barcode.objects.filter(generated_by=self.request.user).select_related('product')

class AISuggestView(APIView):
    """POST /api/barcodes/ai-suggest/ — AI suggests best format"""
    def post(self, request):
        value = request.data.get('value', '')
        product_type = request.data.get('product_type', '')
        suggestion = 'CODE128'
        reason = 'CODE128 is the most versatile format for alphanumeric data'
        if value.startswith('http') or value.startswith('www'):
            suggestion = 'QR'
            reason = 'QR Code is optimal for URLs and web links'
        elif value.isdigit() and len(value) == 13:
            suggestion = 'EAN13'
            reason = 'EAN-13 matches the 13-digit global retail standard'
        elif value.isdigit() and len(value) == 12:
            suggestion = 'UPC'
            reason = 'UPC-A is the standard for 12-digit North American retail products'
        elif value.isdigit() and len(value) == 8:
            suggestion = 'EAN8'
            reason = 'EAN-8 is compact and efficient for 8-digit numeric codes'
        elif 'warehouse' in product_type.lower() or 'industrial' in product_type.lower():
            suggestion = 'CODE128'
            reason = 'CODE128 handles alphanumeric SKUs efficiently for industrial operations'
        return Response({'suggestion': suggestion, 'reason': reason, 'value': value})
