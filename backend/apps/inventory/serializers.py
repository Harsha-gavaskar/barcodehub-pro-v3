from rest_framework import serializers
from .models import StockAdjustment

class StockAdjustmentSerializer(serializers.ModelSerializer):
    adjusted_by_name = serializers.CharField(source='adjusted_by.full_name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = StockAdjustment
        fields = ['id', 'product', 'product_name', 'quantity', 'reason', 'notes', 'adjusted_by', 'adjusted_by_name', 'created_at']
        read_only_fields = ['id', 'adjusted_by', 'adjusted_by_name', 'created_at']

    def create(self, validated_data):
        validated_data['adjusted_by'] = self.context['request'].user
        product = validated_data['product']
        qty = validated_data['quantity']
        
        # Apply stock adjustment to Product
        product.stock += qty
        product.save(update_fields=['stock'])
        
        return super().create(validated_data)
