from rest_framework import serializers
from .models import Barcode

class BarcodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Barcode
        fields = ['id', 'product', 'value', 'format', 'svg_data', 'png_file',
                  'width', 'height', 'display_value', 'background_color',
                  'foreground_color', 'label', 'generated_by', 'created_at']
        read_only_fields = ['id', 'svg_data', 'png_file', 'generated_by', 'created_at']

class GenerateBarcodeSerializer(serializers.Serializer):
    value = serializers.CharField(max_length=500)
    format = serializers.ChoiceField(choices=['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QR', 'DATAMATRIX', 'PDF417'])
    width = serializers.FloatField(default=2.0, min_value=0.5, max_value=5.0)
    height = serializers.IntegerField(default=80, min_value=20, max_value=300)
    display_value = serializers.BooleanField(default=True)
    background_color = serializers.CharField(default='#ffffff', max_length=7)
    foreground_color = serializers.CharField(default='#000000', max_length=7)
    label = serializers.CharField(default='', allow_blank=True)
    product_id = serializers.UUIDField(required=False, allow_null=True)
    save = serializers.BooleanField(default=False)

class BatchBarcodeSerializer(serializers.Serializer):
    items = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField()),
        min_length=1, max_length=500
    )
    format = serializers.ChoiceField(choices=['CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'QR'])
