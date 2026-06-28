import uuid
from django.db import models
from apps.users.models import User, Company


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='categories', null=True, blank=True)
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    BARCODE_FORMAT_CHOICES = [
        ('CODE128', 'CODE 128'),
        ('CODE39', 'CODE 39'),
        ('EAN13', 'EAN-13'),
        ('EAN8', 'EAN-8'),
        ('UPC', 'UPC-A'),
        ('QR', 'QR Code'),
        ('DATAMATRIX', 'Data Matrix'),
        ('PDF417', 'PDF417'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('discontinued', 'Discontinued'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='products_created')

    # Core Fields
    name = models.CharField(max_length=255, db_index=True)
    sku = models.CharField(max_length=100, db_index=True)
    barcode = models.CharField(max_length=255, db_index=True)
    barcode_format = models.CharField(max_length=20, choices=BARCODE_FORMAT_CHOICES, default='CODE128')
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Classification
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    # Physical
    weight = models.CharField(max_length=50, blank=True)
    dimensions = models.CharField(max_length=100, blank=True)
    manufacturer = models.CharField(max_length=255, blank=True)
    supplier = models.CharField(max_length=255, blank=True)
    country_of_origin = models.CharField(max_length=100, blank=True)

    # Inventory
    stock = models.IntegerField(default=0)
    reserved_stock = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=10)
    location = models.CharField(max_length=100, blank=True)

    # Dates
    expiry_date = models.DateField(null=True, blank=True)
    manufacture_date = models.DateField(null=True, blank=True)
    batch_number = models.CharField(max_length=100, blank=True)

    # Google Sheets source
    sheet_id = models.CharField(max_length=255, blank=True)
    sheet_row = models.IntegerField(null=True, blank=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    tags = models.JSONField(default=list, blank=True)
    custom_fields = models.JSONField(default=dict, blank=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['company', 'sku']),
            models.Index(fields=['company', 'barcode']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'{self.name} ({self.sku})'

    @property
    def available_stock(self):
        return max(0, self.stock - self.reserved_stock)

    @property
    def is_low_stock(self):
        return 0 < self.available_stock <= self.low_stock_threshold

    @property
    def is_out_of_stock(self):
        return self.available_stock == 0
