from django.db import models
from django.contrib.auth.models import User

class Score(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='scores')
    score = models.FloatField()  # Using FloatField for precise timing (ms)
    game_type = models.CharField(max_length=50, default='reaction_time')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['score']  # Ascending order for reaction time (lower is better)

    def __str__(self):
        return f"{self.user.username} - {self.score}ms"
