from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.permissions import AllowAny
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

class PublicSpectacularAPIView(SpectacularAPIView):
    permission_classes = [AllowAny]

class PublicSpectacularSwaggerView(SpectacularSwaggerView):
    permission_classes = [AllowAny]

class PublicSpectacularRedocView(SpectacularRedocView):
    permission_classes = [AllowAny]

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API Docs
    path('api/schema/', PublicSpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', PublicSpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', PublicSpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API v1
    path('api/auth/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/barcodes/', include('apps.barcodes.urls')),
    path('api/labels/', include('apps.labels.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/print/', include('apps.printers.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/google-sheets/', include('apps.google_sheets.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
