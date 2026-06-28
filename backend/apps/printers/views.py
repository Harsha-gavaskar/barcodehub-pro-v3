from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Printer, PrintJob
from .serializers import PrinterSerializer, PrintJobSerializer
from apps.users.views import log_action

class PrinterViewSet(ModelViewSet):
    serializer_class = PrinterSerializer
    def get_queryset(self):
        qs = Printer.objects.all()
        if self.request.user.company:
            qs = qs.filter(company=self.request.user.company)
        return qs

class PrintJobViewSet(ModelViewSet):
    serializer_class = PrintJobSerializer
    ordering = ['-created_at']
    def get_queryset(self):
        qs = PrintJob.objects.select_related('printer','created_by','label_template')
        if self.request.user.role not in ('admin','manager'):
            qs = qs.filter(created_by=self.request.user)
        return qs
    def perform_create(self, serializer):
        job = serializer.save()
        from .tasks import process_print_job
        process_print_job.delay(str(job.id))
        log_action(self.request.user, f'Created Print Job: {job.title}', 'print_jobs', str(job.id), request=self.request)
    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        job = self.get_object()
        if job.status in ('queued',):
            job.status = 'cancelled'
            job.save()
            return Response({'message': 'Job cancelled'})
        return Response({'error': 'Cannot cancel job in current state'}, status=status.HTTP_400_BAD_REQUEST)
