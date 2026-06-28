import uuid
from django.db import models
from apps.users.models import User, Company

class Printer(models.Model):
    PRINTER_TYPES = [('laser','Laser'),('thermal','Thermal'),('inkjet','Inkjet'),('dot_matrix','Dot Matrix')]
    STATUS_CHOICES = [('online','Online'),('offline','Offline'),('busy','Busy'),('error','Error')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True, related_name='printers')
    name = models.CharField(max_length=255)
    printer_type = models.CharField(max_length=20, choices=PRINTER_TYPES, default='laser')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')
    location = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    port = models.IntegerField(default=9100)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        db_table = 'printers'
    def __str__(self):
        return self.name

class PrintJob(models.Model):
    STATUS_CHOICES = [('queued','Queued'),('printing','Printing'),('done','Done'),('failed','Failed'),('cancelled','Cancelled')]
    PAPER_SIZES = [('a4','A4'),('a5','A5'),('4x6','4x6 inch'),('2x1','2x1 inch'),('custom','Custom')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='print_jobs')
    printer = models.ForeignKey(Printer, on_delete=models.SET_NULL, null=True, related_name='jobs')
    label_template = models.ForeignKey('labels.LabelTemplate', on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255)
    quantity = models.IntegerField(default=1)
    paper_size = models.CharField(max_length=20, choices=PAPER_SIZES, default='a4')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    pages = models.IntegerField(default=1)
    error_message = models.TextField(blank=True)
    barcode_format = models.CharField(max_length=20, blank=True)
    product_ids = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        db_table = 'print_jobs'
        ordering = ['-created_at']
    def __str__(self):
        return f'{self.title} [{self.status}]'
