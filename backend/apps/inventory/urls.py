from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('adjustments', views.StockAdjustmentViewSet, basename='stock-adjustment')

urlpatterns = [
    path('', include(router.urls)),
]
