from rest_framework import serializers
from .models import DailyPrintSnapshot

class DailyPrintSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyPrintSnapshot
        fields = ['id', 'date', 'generated_count', 'printed_count', 'failed_count']
