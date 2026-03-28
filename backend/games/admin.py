from django.contrib import admin
from .models import Score

@admin.register(Score)
class ScoreAdmin(admin.ModelAdmin):
    list_display = ('user', 'score', 'game_type', 'created_at')
    list_filter = ('game_type', 'created_at')
    search_fields = ('user__username',)
