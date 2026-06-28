from rest_framework import serializers
from .models import Printer, PrintJob

class PrinterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Printer
        fields = ['id','name','printer_type','status','location','ip_address','port','is_default','created_at']
        read_only_fields = ['id','created_at']

class PrintJobSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    printer_name = serializers.CharField(source='printer.name', read_only=True)
    class Meta:
        model = PrintJob
        fields = ['id','title','quantity','paper_size','status','pages','barcode_format',
                  'printer','printer_name','label_template','product_ids','error_message',
                  'created_by','created_by_name','created_at','started_at','completed_at']
        read_only_fields = ['id','created_by_name','printer_name','created_at','started_at','completed_at']
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
