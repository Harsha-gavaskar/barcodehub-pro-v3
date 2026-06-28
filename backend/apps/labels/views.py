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
        qs = LabelTemplate.objects.select_related('created_by', 'company')
        user = self.request.user
        if user.company:
            from django.db.models import Q
            qs = qs.filter(Q(company=user.company) | Q(is_public=True))
        return qs
