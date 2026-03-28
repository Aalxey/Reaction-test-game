from django.urls import path
from .views import (
    RegisterView, LoginView, VerifyEmailView, 
    ForgotPasswordView, ResetPasswordView, ProfileView,
    UserSearchView, SendFriendRequestView, ListFriendsView,
    ListPendingRequestsView, HandleFriendRequestView, RemoveFriendView,
    AdminUserListView, AdminUserDetailView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('search/', UserSearchView.as_view(), name='user-search'),
    path('friend-request/', SendFriendRequestView.as_view(), name='friend-request'),
    path('friends/', ListFriendsView.as_view(), name='friends-list'),
    path('remove-friend/', RemoveFriendView.as_view(), name='remove-friend'),
    path('pending-requests/', ListPendingRequestsView.as_view(), name='pending-requests'),
    path('handle-request/<int:pk>/', HandleFriendRequestView.as_view(), name='handle-request'),
    # Admin Routes
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]
