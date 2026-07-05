from django.urls import path
from . import views

urlpatterns = [
    path('exports/', views.ReportExportListView.as_view(), name='report-export-list'),
]
