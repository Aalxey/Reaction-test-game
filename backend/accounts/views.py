from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Min, Q
from .serializers import UserSerializer, UserProfileSerializer, UserSearchSerializer, FriendshipSerializer
from .models import OTP, UserProfile, Friendship
from rest_framework.authtoken.models import Token
import random
import string
import re

def validate_password(password):
    if len(password) < 6:
        return False, "Password must be at least 6 characters long."
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number."
    return True, ""

class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        is_valid, error_msg = validate_password(password)
        if not is_valid:
            return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)


        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            if user.is_active:
                return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
            # If inactive, we will update it below (allow re-signup)
        
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            if user.is_active:
                return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
            # If inactive, we will update it below

        # Generate OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        
        # Save OTP
        OTP.objects.create(email=email, otp=otp_code, purpose='signup')

        # Send Email
        try:
            send_mail(
                'Verify your email',
                f'Your OTP code is {otp_code}',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({"error": f"Failed to send email: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Create or Update User
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            user.username = username
            user.set_password(password)
            user.save()
        else:
            user = User.objects.create_user(username=username, email=email, password=password)
            user.is_active = False
            user.save()

        return Response({"message": "OTP sent to email", "email": email}, status=status.HTTP_201_CREATED)

class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get("email")
        otp_code = request.data.get("otp")

        try:
            otp_record = OTP.objects.filter(email=email, otp=otp_code, purpose='signup', is_used=False).latest('created_at')
        except OTP.DoesNotExist:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        if not otp_record.is_valid():
            return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        # Activate User
        try:
            user = User.objects.get(email=email)
            user.is_active = True
            user.save()
            
            # Mark OTP as used
            otp_record.is_used = True
            otp_record.save()
            
            return Response({"message": "Email verified successfully", "username": user.username}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
             return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        
        # 1. Check if user exists
        user_obj = User.objects.filter(username=username).first()
        if not user_obj:
            print(f"FAILED LOGIN: User '{username}' does not exist.")
            return Response(
                {"error": "User does not exist. Please check your username or register."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Check if user is active
        if not user_obj.is_active:
            print(f"FAILED LOGIN: User '{username}' exists but is not active.")
            return Response(
                {"error": "Account not verified. Please check your email for the OTP code."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # 3. Authenticate with password
        user = authenticate(username=username, password=password)
        
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key, 
                "username": user.username,
                "email": user.email,
                "is_superuser": user.is_superuser
            })
        else:
            print(f"FAILED LOGIN: Incorrect password for user '{username}'.")
            return Response(
                {"error": "Incorrect password. Please try again."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

class ForgotPasswordView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get("email")
        
        if not User.objects.filter(email=email).exists():
            return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Generate OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        
        # Save OTP
        OTP.objects.create(email=email, otp=otp_code, purpose='reset')

        # Send Email
        try:
            send_mail(
                'Password Reset OTP',
                f'Your password reset OTP is {otp_code}',
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
        except Exception as e:
            return Response({"error": "Failed to send email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "OTP sent to email"}, status=status.HTTP_200_OK)

class ResetPasswordView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get("email")
        otp_code = request.data.get("otp")
        new_password = request.data.get("password")

        is_valid, error_msg = validate_password(new_password)
        if not is_valid:
            return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)

        try:
            otp_record = OTP.objects.filter(email=email, otp=otp_code, purpose='reset', is_used=False).latest('created_at')
        except OTP.DoesNotExist:
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        if not otp_record.is_valid():
            return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

        # Update Password
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        # Mark OTP as used
        otp_record.is_used = True
        otp_record.save()
        
        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user.profile

class UserSearchView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSearchSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            return User.objects.filter(username__icontains=query).exclude(id=self.request.user.id)[:10]
        return User.objects.none()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class SendFriendRequestView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        to_user_id = request.data.get('to_user_id')
        if not to_user_id:
            return Response({"error": "Target user ID required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            to_user = User.objects.get(id=to_user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        if to_user == request.user:
            return Response({"error": "Cannot friend yourself"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if friendship already exists (any direction)
        existing = Friendship.objects.filter(
            (Q(from_user=request.user) & Q(to_user=to_user)) |
            (Q(from_user=to_user) & Q(to_user=request.user))
        ).first()

        if existing:
            if existing.status == 'accepted':
                return Response({"message": "You are already allies with this operative"}, status=status.HTTP_200_OK)
            
            if existing.from_user == request.user:
                return Response({"message": "Request already pending. Protocol initiated."}, status=status.HTTP_200_OK)
            else:
                # This is a reciprocal request! The other person already sent one to us.
                # Auto-accept it.
                existing.status = 'accepted'
                existing.save()
                return Response({"message": "Interface synchronized. Friendship established."}, status=status.HTTP_201_CREATED)

        # Create new request
        Friendship.objects.create(
            from_user=request.user,
            to_user=to_user,
            status='pending'
        )

        return Response({"message": "Friend request sent"}, status=status.HTTP_201_CREATED)

class ListFriendsView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = FriendshipSerializer

    def get_queryset(self):
        return Friendship.objects.filter(
            Q(from_user=self.request.user) | Q(to_user=self.request.user),
            status='accepted'
        )

class ListPendingRequestsView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = FriendshipSerializer

    def get_queryset(self):
        return Friendship.objects.filter(
            to_user=self.request.user,
            status='pending'
        )

class HandleFriendRequestView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, pk):
        action = request.data.get('action') # 'accept' or 'reject'
        try:
            friendship = Friendship.objects.get(id=pk, to_user=request.user, status='pending')
        except Friendship.DoesNotExist:
            return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

        if action == 'accept':
            friendship.status = 'accepted'
            friendship.save()
            return Response({"message": "Friendship established"})
        elif action == 'reject':
            friendship.delete()
            return Response({"message": "Request declined"})
        else:
            return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

class RemoveFriendView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        to_user_id = request.data.get('to_user_id')
        if not to_user_id:
            return Response({"error": "Target user ID required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_user = User.objects.get(id=to_user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        # Find and delete friendship in any direction
        friendship = Friendship.objects.filter(
            (Q(from_user=request.user) & Q(to_user=target_user)) |
            (Q(from_user=target_user) & Q(to_user=request.user))
        ).filter(status='accepted').first()

        if friendship:
            friendship.delete()
            return Response({"message": "Friendship terminated. Connection severed."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "No active friendship found with this operative"}, status=status.HTTP_400_BAD_REQUEST)

class AdminUserListView(generics.ListAPIView):
    permission_classes = (permissions.IsAdminUser,)
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSearchSerializer

class AdminUserDetailView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            profile = user.profile
            
            # Use UserProfileSerializer which already has some stats
            profile_serializer = UserProfileSerializer(profile, context={'request': request})
            
            # Get recent games
            from games.models import Score
            from games.serializers import ScoreSerializer
            recent_scores = Score.objects.filter(user=user).order_by('-created_at')[:20]
            scores_serializer = ScoreSerializer(recent_scores, many=True, context={'request': request})
            
            return Response({
                "profile": profile_serializer.data,
                "recent_scores": scores_serializer.data,
                "user_details": {
                    "id": user.id,
                    "date_joined": user.date_joined,
                    "last_login": user.last_login,
                    "is_active": user.is_active
                }
            })
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
