from rest_framework.viewsets import ModelViewSet
from rest_framework import filters
from .models import LabelTemplate
from .serializers import LabelTemplateSerializer

class LabelTemplateViewSet(ModelViewSet):
    serializer_class = LabelTemplateSerializer
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return LabelTemplate.objects.all()
