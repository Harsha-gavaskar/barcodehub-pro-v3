from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import ReportExport
from .serializers import ReportExportSerializer
from .tasks import generate_report_file
from apps.users.views import log_action

class ReportExportListView(generics.ListCreateAPIView):
    serializer_class = ReportExportSerializer

    def get_queryset(self):
        qs = ReportExport.objects.select_related('generated_by')
        if self.request.user.company:
            qs = qs.filter(company=self.request.user.company)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        params = self.request.data.get('parameters', {})
        report = serializer.save(
            company=user.company,
            generated_by=user,
            parameters=params
        )
        # Queue task
        generate_report_file.delay(str(report.id))
        log_action(user, f"Requested Report: {report.report_type} ({report.format})", 'reports', str(report.id), request=self.request)
