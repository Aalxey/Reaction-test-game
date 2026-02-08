from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer
from django.contrib.auth.models import User

# Ensure we import Token if we use Token authentication later, 
# for now simple JSON response is fine or we can add simple token logic

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        
        # Django authenticate checks the database
        user = authenticate(username=username, password=password)
        
        if user:
            return Response({
                "token": "dummy-token-for-now", 
                "username": user.username,
                "email": user.email
            })
        else:
            return Response(
                {"error": "Invalid Credentials"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
