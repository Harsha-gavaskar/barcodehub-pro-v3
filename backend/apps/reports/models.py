import uuid
from django.db import models
from apps.users.models import User, Company

class ReportExport(models.Model):
    REPORT_TYPES = [
        ('labels', 'Labels Activity'),
        ('products', 'Product Catalog'),
        ('inventory', 'Inventory Status'),
        ('print_jobs', 'Print Jobs History'),
        ('audit', 'Audit Log Trail'),
    ]
    FORMAT_CHOICES = [
        ('pdf', 'PDF'),
        ('xlsx', 'Excel'),
        ('csv', 'CSV'),
    ]
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='report_exports')
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='report_exports')
    
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='queued')
    
    file = models.FileField(upload_to='reports/', blank=True, null=True)
    file_size = models.IntegerField(default=0)  # in bytes
    error_message = models.TextField(blank=True)
    
    parameters = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'report_exports'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.report_type} ({self.format}) - {self.status}"
