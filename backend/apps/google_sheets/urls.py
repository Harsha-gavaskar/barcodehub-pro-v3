from django.urls import path
from . import views

urlpatterns = [
    path('config/', views.SheetSyncConfigView.as_view(), name='sheet-config'),
    path('sync/', views.TriggerSyncView.as_view(), name='sheet-sync-trigger'),
]
