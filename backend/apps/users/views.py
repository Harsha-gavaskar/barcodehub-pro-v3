from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from django.conf import settings
from django.utils import timezone
import requests
import logging

from .models import User, AuditLog
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    OTPRequestSerializer, OTPVerifySerializer, ChangePasswordSerializer,
    ForgotPasswordSerializer, GoogleAuthSerializer, TwoFASetupSerializer,
    AuditLogSerializer, TokenResponseSerializer,
)
from apps.notifications.services import NotificationService

logger = logging.getLogger(__name__)


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')


def log_action(user, action, resource, resource_id='', payload=None, request=None):
    AuditLog.objects.create(
        user=user,
        action=action,
        resource=resource,
        resource_id=resource_id,
        payload=payload or {},
        ip_address=get_client_ip(request) if request else None,
        user_agent=request.META.get('HTTP_USER_AGENT', '') if request else '',
    )


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — Create new user account"""
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        tokens = TokenResponseSerializer.get_tokens_for_user(user)
        log_action(user, 'Registered', 'users', str(user.id), request=request)
        return Response({
            **tokens,
            'user': UserSerializer(user, context={'request': request}).data,
            'message': 'Account created successfully',
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """POST /api/auth/login/ — Authenticate with email & password"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Update last login IP
        user.last_login_ip = get_client_ip(request)
        user.save(update_fields=['last_login_ip'])

        tokens = TokenResponseSerializer.get_tokens_for_user(user)
        log_action(user, 'Logged In', 'users', str(user.id), request=request)

        return Response({
            **tokens,
            'user': UserSerializer(user, context={'request': request}).data,
        })


class LogoutView(APIView):
    """POST /api/auth/logout/ — Blacklist refresh token"""

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            log_action(request.user, 'Logged Out', 'users', str(request.user.id), request=request)
            return Response({'message': 'Logged out successfully'})
        except TokenError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PATCH /api/auth/me/ — Get or update current user"""
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """POST /api/auth/change-password/ — Change password"""

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Incorrect current password'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        log_action(user, 'Changed Password', 'users', str(user.id), request=request)
        return Response({'message': 'Password updated successfully'})


class OTPRequestView(APIView):
    """POST /api/auth/otp/request/ — Send OTP to phone"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']

        try:
            user = User.objects.get(phone=phone)
            code = user.generate_otp()
            NotificationService.send_sms(phone, f'Your BarcodeHub Pro OTP is: {code}')
            return Response({'message': 'OTP sent successfully'})
        except User.DoesNotExist:
            # Don't reveal if phone exists
            return Response({'message': 'OTP sent if phone is registered'})


class OTPVerifyView(APIView):
    """POST /api/auth/otp/verify/ — Verify OTP and get tokens"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        code = serializer.validated_data['code']

        try:
            user = User.objects.get(phone=phone)
            if not user.verify_otp(code):
                return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
            tokens = TokenResponseSerializer.get_tokens_for_user(user)
            log_action(user, 'OTP Login', 'users', str(user.id), request=request)
            return Response({
                **tokens,
                'user': UserSerializer(user, context={'request': request}).data,
            })
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class GoogleAuthView(APIView):
    """POST /api/auth/google/ — OAuth2 Google sign-in"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code']

        # Exchange code for tokens
        token_url = 'https://oauth2.googleapis.com/token'
        token_data = {
            'code': code,
            'client_id': settings.GOOGLE_CLIENT_ID,
            'client_secret': settings.GOOGLE_CLIENT_SECRET,
            'redirect_uri': settings.GOOGLE_REDIRECT_URI,
            'grant_type': 'authorization_code',
        }
        token_response = requests.post(token_url, data=token_data)
        if not token_response.ok:
            return Response({'error': 'Failed to exchange Google code'}, status=status.HTTP_400_BAD_REQUEST)

        token_json = token_response.json()
        access_token = token_json.get('access_token')

        # Get user info
        userinfo_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
        userinfo = requests.get(userinfo_url, headers={'Authorization': f'Bearer {access_token}'}).json()

        google_id = userinfo.get('id')
        email = userinfo.get('email')
        first_name = userinfo.get('given_name', '')
        last_name = userinfo.get('family_name', '')

        # Get or create user
        user, created = User.objects.get_or_create(
            google_id=google_id,
            defaults={
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'is_email_verified': True,
                'google_access_token': token_json.get('access_token', ''),
                'google_refresh_token': token_json.get('refresh_token', ''),
            }
        )
        if not created:
            user.google_access_token = token_json.get('access_token', '')
            if token_json.get('refresh_token'):
                user.google_refresh_token = token_json['refresh_token']
            user.save(update_fields=['google_access_token', 'google_refresh_token'])

        tokens = TokenResponseSerializer.get_tokens_for_user(user)
        log_action(user, 'Google OAuth Login', 'users', str(user.id), request=request)
        return Response({
            **tokens,
            'user': UserSerializer(user, context={'request': request}).data,
            'created': created,
        })


class TwoFASetupView(APIView):
    """POST /api/auth/2fa/setup/ — Enable 2FA"""

    def post(self, request):
        user = request.user
        secret = user.generate_totp_secret()
        import pyotp
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(name=user.email, issuer_name='BarcodeHub Pro')
        return Response({
            'secret': secret,
            'provisioning_uri': provisioning_uri,
            'message': 'Scan the QR code in your authenticator app',
        })


class TwoFAVerifyView(APIView):
    """POST /api/auth/2fa/verify/ — Verify and enable 2FA"""

    def post(self, request):
        serializer = TwoFASetupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if user.verify_totp(serializer.validated_data['token']):
            user.two_fa_enabled = True
            user.save(update_fields=['two_fa_enabled'])
            log_action(user, 'Enabled 2FA', 'users', str(user.id), request=request)
            return Response({'message': '2FA enabled successfully'})
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    """POST /api/auth/forgot-password/ — Send reset email"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            reset_token = RefreshToken.for_user(user)
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={str(reset_token.access_token)}"
            NotificationService.send_email(
                to=email,
                subject='Reset your BarcodeHub Pro password',
                body=f'Click here to reset your password: {reset_url}\n\nThis link expires in 1 hour.',
            )
        except User.DoesNotExist:
            pass  # Don't reveal if email exists
        return Response({'message': 'If this email is registered, a reset link has been sent'})


class AuditLogListView(generics.ListAPIView):
    """GET /api/auth/audit-logs/ — List audit logs (admin only)"""
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        user = self.request.user
        qs = AuditLog.objects.select_related('user')
        if user.role != 'admin':
            qs = qs.filter(user=user)
        return qs


class UserListView(generics.ListAPIView):
    """GET /api/auth/users/ — List all users (admin only)"""
    serializer_class = UserSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role != 'admin':
            return User.objects.filter(id=user.id)
        qs = User.objects.select_related('company', 'branch')
        if user.company:
            qs = qs.filter(company=user.company)
        return qs


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/auth/users/<id>/ — Manage user"""
    serializer_class = UserSerializer
    queryset = User.objects.all()
    lookup_field = 'id'
