from rest_framework.viewsets import ModelViewSet
from .models import StockAdjustment
from .serializers import StockAdjustmentSerializer
from apps.users.views import log_action

class StockAdjustmentViewSet(ModelViewSet):
    serializer_class = StockAdjustmentSerializer
    
    def get_queryset(self):
        qs = StockAdjustment.objects.select_related('product', 'adjusted_by')
        if self.request.user.company:
            qs = qs.filter(product__company=self.request.user.company)
        return qs

    def perform_create(self, serializer):
        adj = serializer.save()
        log_action(self.request.user, f"Adjusted stock for {adj.product.name} ({adj.quantity:+})", 'inventory', str(adj.id), request=self.request)
