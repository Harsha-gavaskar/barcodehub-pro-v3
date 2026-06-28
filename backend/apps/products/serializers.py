from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'description', 'children', 'created_at']
        read_only_fields = ['id', 'children', 'created_at']

    def get_children(self, obj):
        return CategorySerializer(obj.children.all(), many=True).data


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    available_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    is_out_of_stock = serializers.ReadOnlyField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'barcode', 'barcode_format', 'price',
            'category', 'category_name', 'description', 'status',
            'weight', 'dimensions', 'manufacturer', 'supplier', 'country_of_origin',
            'stock', 'reserved_stock', 'available_stock', 'low_stock_threshold',
            'location', 'expiry_date', 'manufacture_date', 'batch_number',
            'tags', 'custom_fields', 'image', 'image_url',
            'is_low_stock', 'is_out_of_stock',
            'last_synced_at', 'created_by', 'created_by_name',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'available_stock', 'is_low_stock', 'is_out_of_stock',
            'image_url', 'created_by_name', 'category_name',
            'last_synced_at', 'created_at', 'updated_at',
        ]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        if self.context['request'].user.company:
            validated_data['company'] = self.context['request'].user.company
        return super().create(validated_data)


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    available_stock = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()
    is_out_of_stock = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'sku', 'barcode', 'barcode_format', 'price',
            'category_name', 'status', 'stock', 'available_stock',
            'is_low_stock', 'is_out_of_stock', 'location', 'manufacturer',
            'expiry_date', 'updated_at',
        ]


class BulkProductSerializer(serializers.Serializer):
    """For CSV/Excel/Sheets bulk import"""
    products = ProductSerializer(many=True)

    def create(self, validated_data):
        request = self.context['request']
        company = request.user.company
        created_by = request.user
        products = []
        for product_data in validated_data['products']:
            product_data['company'] = company
            product_data['created_by'] = created_by
            products.append(Product(**product_data))
        return Product.objects.bulk_create(products, ignore_conflicts=True)
