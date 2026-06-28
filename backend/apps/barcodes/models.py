import uuid
from django.db import models
from apps.products.models import Product
from apps.users.models import User

class Barcode(models.Model):
    BARCODE_FORMATS = [
        ('CODE128', 'CODE 128'),
        ('CODE39', 'CODE 39'),
        ('EAN13', 'EAN-13'),
        ('EAN8', 'EAN-8'),
        ('UPC', 'UPC-A'),
        ('QR', 'QR Code'),
        ('DATAMATRIX', 'Data Matrix'),
        ('PDF417', 'PDF417'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='barcodes', null=True, blank=True)
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='barcodes_generated')

    value = models.CharField(max_length=500)
    format = models.CharField(max_length=20, choices=BARCODE_FORMATS, default='CODE128')

    # Generated files
    svg_data = models.TextField(blank=True)
    png_file = models.FileField(upload_to='barcodes/png/', blank=True, null=True)
    pdf_file = models.FileField(upload_to='barcodes/pdf/', blank=True, null=True)

    # Config
    width = models.FloatField(default=2.0)
    height = models.IntegerField(default=80)
    display_value = models.BooleanField(default=True)
    background_color = models.CharField(max_length=7, default='#ffffff')
    foreground_color = models.CharField(max_length=7, default='#000000')
    label = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'barcodes'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.format}: {self.value}'
