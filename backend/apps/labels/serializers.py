from rest_framework import serializers
from .models import LabelTemplate

class LabelTemplateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    thumbnail_url = serializers.SerializerMethodField()
    class Meta:
        model = LabelTemplate
        fields = ['id', 'name', 'description', 'canvas_json', 'thumbnail', 'thumbnail_url',
                  'width', 'height', 'background_color', 'is_default', 'is_public',
                  'category', 'created_by', 'created_by_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by_name', 'thumbnail_url', 'created_at', 'updated_at']

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url
        return None

    def create(self, validated_data):
        user = self.context['request'].user
        if user and user.is_authenticated:
            validated_data['created_by'] = user
            if hasattr(user, 'company') and user.company:
                validated_data['company'] = user.company
        return super().create(validated_data)
