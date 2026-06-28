from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.GenerateBarcodeView.as_view(), name='generate-barcode'),
    path('batch/', views.BatchGenerateView.as_view(), name='batch-generate'),
    path('history/', views.BarcodeHistoryView.as_view(), name='barcode-history'),
    path('ai-suggest/', views.AISuggestView.as_view(), name='ai-suggest'),
]
