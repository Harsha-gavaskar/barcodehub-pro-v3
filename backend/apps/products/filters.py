import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    sku = django_filters.CharFilter(lookup_expr='icontains')
    barcode = django_filters.CharFilter(lookup_expr='icontains')
    manufacturer = django_filters.CharFilter(lookup_expr='icontains')
    category = django_filters.UUIDFilter(field_name='category__id')
    category_name = django_filters.CharFilter(field_name='category__name', lookup_expr='icontains')
    status = django_filters.ChoiceFilter(choices=Product.STATUS_CHOICES)
    barcode_format = django_filters.ChoiceFilter(choices=Product.BARCODE_FORMAT_CHOICES)
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_stock = django_filters.NumberFilter(field_name='stock', lookup_expr='gte')
    max_stock = django_filters.NumberFilter(field_name='stock', lookup_expr='lte')
    low_stock = django_filters.BooleanFilter(method='filter_low_stock')
    out_of_stock = django_filters.BooleanFilter(method='filter_out_of_stock')
    location = django_filters.CharFilter(lookup_expr='icontains')
    expiry_before = django_filters.DateFilter(field_name='expiry_date', lookup_expr='lte')
    expiry_after = django_filters.DateFilter(field_name='expiry_date', lookup_expr='gte')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = Product
        fields = ['name', 'sku', 'barcode', 'status', 'barcode_format',
                  'manufacturer', 'location', 'category']

    def filter_low_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0, stock__lte=10)
        return queryset

    def filter_out_of_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock=0)
        return queryset
