from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SheetSyncConfig
from .serializers import SheetSyncConfigSerializer
from .tasks import sync_company_sheet

class SheetSyncConfigView(generics.RetrieveUpdateAPIView):
    """GET/PUT/PATCH /api/google-sheets/config/ — Manage sheet config"""
    serializer_class = SheetSyncConfigSerializer

    def get_object(self):
        # Create one if missing
        company = self.request.user.company
        config, _ = SheetSyncConfig.objects.get_or_create(
            company=company,
            defaults={'user': self.request.user}
        )
        return config

class TriggerSyncView(APIView):
    """POST /api/google-sheets/sync/ — Manually trigger sync"""
    def post(self, request):
        company = request.user.company
        try:
            config = SheetSyncConfig.objects.get(company=company)
            # Run async
            sync_company_sheet.delay(str(config.id))
            return Response({'message': 'Sync started in background'})
        except SheetSyncConfig.DoesNotExist:
            return Response({'error': 'Sheet configuration not found. Setup config first.'}, status=status.HTTP_404_NOT_FOUND)
