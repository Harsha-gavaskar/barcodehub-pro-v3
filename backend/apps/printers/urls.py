from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('printers', views.PrinterViewSet, basename='printer')
router.register('jobs', views.PrintJobViewSet, basename='print-job')

urlpatterns = [
    path('', include(router.urls)),
]
