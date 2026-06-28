from rest_framework import serializers
from .models import ReportExport

class ReportExportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.full_name', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ReportExport
        fields = ['id', 'report_type', 'format', 'status', 'file', 'file_url', 'file_size',
                  'error_message', 'parameters', 'generated_by', 'generated_by_name',
                  'created_at', 'completed_at']
        read_only_fields = ['id', 'status', 'file', 'file_url', 'file_size', 'error_message',
                            'generated_by', 'created_at', 'completed_at']

    def get_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None
        
    def get_file_url(self, obj):
        return self.get_url(obj)
