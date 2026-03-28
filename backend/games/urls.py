from django.urls import path
from .views import ScoreListCreateView, UserScoreHistoryView

urlpatterns = [
    path('scores/', ScoreListCreateView.as_view(), name='score-list-create'),
    path('my-history/', UserScoreHistoryView.as_view(), name='user-history'),
]
