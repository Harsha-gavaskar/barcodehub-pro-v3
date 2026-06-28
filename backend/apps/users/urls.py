from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Registration & Login
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Current user
    path('me/', views.MeView.as_view(), name='me'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),

    # OTP
    path('otp/request/', views.OTPRequestView.as_view(), name='otp-request'),
    path('otp/verify/', views.OTPVerifyView.as_view(), name='otp-verify'),

    # Google OAuth
    path('google/', views.GoogleAuthView.as_view(), name='google-auth'),

    # 2FA
    path('2fa/setup/', views.TwoFASetupView.as_view(), name='2fa-setup'),
    path('2fa/verify/', views.TwoFAVerifyView.as_view(), name='2fa-verify'),

    # Password reset
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot-password'),

    # Admin
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<uuid:id>/', views.UserDetailView.as_view(), name='user-detail'),
    path('audit-logs/', views.AuditLogListView.as_view(), name='audit-logs'),
]
