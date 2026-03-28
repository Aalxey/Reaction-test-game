from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Friendship
from games.models import Score
from django.db.models import Avg, Min
from django.utils import timezone
import datetime

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.CharField(source='user.email', read_only=True)
    best_score_reaction = serializers.SerializerMethodField()
    average_score_reaction = serializers.SerializerMethodField()
    total_games_reaction = serializers.SerializerMethodField()
    best_score_evade = serializers.SerializerMethodField()
    average_score_evade = serializers.SerializerMethodField()
    total_games_evade = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            'username', 'email', 'bio', 'location', 'avatar', 
            'best_score_reaction', 'average_score_reaction', 'total_games_reaction',
            'best_score_evade', 'average_score_evade', 'total_games_evade'
        )
        read_only_fields = ('email',)

    def update(self, instance, validated_data):
        # Extract user data from the nested source
        user_data = validated_data.pop('user', {})
        new_username = user_data.get('username')
        
        if new_username and new_username != instance.user.username:
            instance.user.username = new_username
            instance.user.save()
            
        return super().update(instance, validated_data)

    def get_best_score_reaction(self, obj):
        best = Score.objects.filter(user=obj.user, game_type='reaction_time').aggregate(Min('score'))['score__min']
        return round(best, 2) if best else None

    def get_average_score_reaction(self, obj):
        avg = Score.objects.filter(user=obj.user, game_type='reaction_time').aggregate(Avg('score'))['score__avg']
        return round(avg, 2) if avg else None

    def get_total_games_reaction(self, obj):
        return Score.objects.filter(user=obj.user, game_type='reaction_time').count()

    def get_best_score_evade(self, obj):
        from django.db.models import Max
        best = Score.objects.filter(user=obj.user, game_type='evade_and_sequence').aggregate(Max('score'))['score__max']
        return round(best, 2) if best else None

    def get_average_score_evade(self, obj):
        avg = Score.objects.filter(user=obj.user, game_type='evade_and_sequence').aggregate(Avg('score'))['score__avg']
        return round(avg, 2) if avg else None

    def get_total_games_evade(self, obj):
        return Score.objects.filter(user=obj.user, game_type='evade_and_sequence').count()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class UserSearchSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(source='profile.avatar', read_only=True)
    is_online = serializers.SerializerMethodField()
    relationship = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'avatar', 'is_online', 'relationship')

    def get_is_online(self, obj):
        if obj.last_login:
            now = timezone.now()
            return obj.last_login > now - datetime.timedelta(minutes=5)
        return False

    def get_relationship(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        from .models import Friendship
        from django.db.models import Q
        
        friendship = Friendship.objects.filter(
            (Q(from_user=request.user) & Q(to_user=obj)) |
            (Q(from_user=obj) & Q(to_user=request.user))
        ).first()
        
        if not friendship:
            return 'none'
        
        if friendship.status == 'accepted':
            return 'friend'
        
        # If pending, we need to know who sent it for UI purposes 
        # (though 'pending' is usually enough to disable the button)
        return 'pending'

class FriendshipSerializer(serializers.ModelSerializer):
    from_user_details = UserSearchSerializer(source='from_user', read_only=True)
    to_user_details = UserSearchSerializer(source='to_user', read_only=True)

    class Meta:
        model = Friendship
        fields = ('id', 'from_user', 'to_user', 'status', 'created_at', 'from_user_details', 'to_user_details')
        read_only_fields = ('from_user', 'status', 'created_at')
