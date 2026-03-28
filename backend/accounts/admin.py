from django.contrib import admin
from .models import OTP, UserProfile

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('email', 'otp', 'purpose', 'is_used', 'created_at')
    list_filter = ('purpose', 'is_used', 'created_at')
    search_fields = ('email',)

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'created_at')
    search_fields = ('user__username', 'location')
