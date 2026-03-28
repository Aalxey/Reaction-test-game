from rest_framework import serializers
from .models import Score

class ScoreSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Score
        fields = ['id', 'user', 'username', 'avatar', 'score', 'game_type', 'created_at']
        read_only_fields = ['user', 'created_at']

    def get_avatar(self, obj):
        if hasattr(obj.user, 'profile') and obj.user.profile.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profile.avatar.url)
            return obj.user.profile.avatar.url
        return None

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
