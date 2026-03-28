from rest_framework import generics, permissions
from django.db.models import Min
from .models import Score
from .serializers import ScoreSerializer

class ScoreListCreateView(generics.ListCreateAPIView):
    serializer_class = ScoreSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        game_type = self.request.query_params.get('game_type', 'reaction_time')
        queryset = Score.objects.filter(game_type=game_type)
        
        from django.db.models import Max
        
        # Determine if we want Min or Max depending on game type
        is_reaction = game_type == 'reaction_time'
        agg_func = Min if is_reaction else Max
        agg_key = 'min_score' if is_reaction else 'max_score'
        order_key = 'score' if is_reaction else '-score'

        # To make it a true leaderboard, we take the best score per user
        best_scores_data = queryset.values('user').annotate(best=agg_func('score'))
        
        # Then we filter the main queryset to only include those best scores for those users
        # Handling ties by showing the most recent best score for each user might be cleaner, 
        # but matching user and score is sufficient for the basic list.
        best_score_pairs = [(s['user'], s['best']) for s in best_scores_data]
        
        from django.db.models import Q
        query_filter = Q()
        for user_id, best in best_score_pairs:
            query_filter |= Q(user_id=user_id, score=best)
        
        if not best_score_pairs:
            return Score.objects.none()

        return queryset.filter(query_filter).order_by(order_key)[:50]


class UserScoreHistoryView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ScoreSerializer

    def get_queryset(self):
        return Score.objects.filter(user=self.request.user).order_by('created_at')
