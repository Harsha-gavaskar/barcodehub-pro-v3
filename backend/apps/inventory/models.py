import uuid
from django.db import models
from apps.products.models import Product
from apps.users.models import User

class StockAdjustment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='adjustments')
    adjusted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='stock_adjustments')
    quantity = models.IntegerField()  # positive for addition, negative for reduction
    reason = models.CharField(max_length=255)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'stock_adjustments'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} - {self.quantity:+} ({self.reason})"
