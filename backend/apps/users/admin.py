from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Company, Branch, AuditLog


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'plan', 'max_users', 'max_products', 'created_at']
    list_filter = ['plan']
    search_fields = ['name']


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'city', 'country', 'created_at']
    list_filter = ['company']
    search_fields = ['name', 'city']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'full_name', 'role', 'company', 'is_active', 'two_fa_enabled', 'created_at']
    list_filter = ['role', 'is_active', 'is_staff', 'two_fa_enabled']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone', 'avatar')}),
        ('Organization', {'fields': ('role', 'company', 'branch')}),
        ('Auth Status', {'fields': ('is_active', 'is_staff', 'is_superuser', 'is_email_verified')}),
        ('Google OAuth', {'fields': ('google_id', 'google_access_token', 'google_refresh_token')}),
        ('2FA', {'fields': ('two_fa_enabled', 'two_fa_secret')}),
        ('OTP', {'fields': ('otp_code', 'otp_expires_at')}),
        ('Permissions', {'fields': ('groups', 'user_permissions')}),
        ('Timestamps', {'fields': ('last_login', 'last_login_ip', 'created_at', 'updated_at')}),
    )
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'resource', 'ip_address', 'timestamp']
    list_filter = ['resource', 'timestamp']
    search_fields = ['user__email', 'action']
    readonly_fields = list_display + ['payload', 'user_agent', 'resource_id']
    ordering = ['-timestamp']
