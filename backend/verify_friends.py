from django.test import Client
from django.contrib.auth.models import User
from accounts.models import Friendship
from django.db.models import Q
import json

def test_friend_system():
    # Setup users
    User.objects.filter(username__in=['UserA', 'UserB']).delete()
    user_a = User.objects.create_user(username='UserA', password='password123')
    user_b = User.objects.create_user(username='UserB', password='password123')
    
    client_a = Client()
    client_a.force_login(user_a)
    
    client_b = Client()
    client_b.force_login(user_b)
    
    print("--- Test 1: User A sends request to B ---")
    response = client_a.post('/api/auth/friend-request/', data=json.dumps({"to_user_id": user_b.id}), content_type='application/json')
    print(f"A -> B Status: {response.status_code}, Msg: {response.json().get('message')}")
    
    print("\n--- Test 2: User B searches for A (should show 'pending') ---")
    response = client_b.get(f'/api/auth/search/?q={user_a.username}')
    results = response.json()
    rel = next((u['relationship'] for u in results if u['username'] == 'UserA'), None)
    print(f"B search A Relationship: {rel}")
    
    print("\n--- Test 3: User B sends reciprocal request to A (should auto-accept) ---")
    response = client_b.post('/api/auth/friend-request/', data=json.dumps({"to_user_id": user_a.id}), content_type='application/json')
    print(f"B -> A Status: {response.status_code}, Msg: {response.json().get('message')}")
    
    print("\n--- Test 4: Verify friendship is accepted for both ---")
    friendship = Friendship.objects.filter(
        (Q(from_user=user_a) & Q(to_user=user_b)) |
        (Q(from_user=user_b) & Q(to_user=user_a))
    ).first()
    print(f"Friendship Status: {friendship.status if friendship else 'Not Found'}")
    
    print("\n--- Test 6: User A removes User B (Defriend) ---")
    response = client_a.post('/api/auth/remove-friend/', data=json.dumps({"to_user_id": user_b.id}), content_type='application/json')
    print(f"A removes B Status: {response.status_code}, Msg: {response.json().get('message')}")
    
    deleted = not Friendship.objects.filter(
        (Q(from_user=user_a) & Q(to_user=user_b)) |
        (Q(from_user=user_b) & Q(to_user=user_a))
    ).exists()
    print(f"Friendship Deleted: {deleted}")

    print("\n--- Test 7: Verify search status returns to 'none' ---")
    response = client_b.get(f'/api/auth/search/?q={user_a.username}')
    rel = next((u['relationship'] for u in response.json() if u['username'] == 'UserA'), None)
    print(f"B search A Relationship: {rel}")

    # Cleanup
    # User.objects.filter(username__in=['UserA', 'UserB']).delete()

if __name__ == "__main__":
    test_friend_system()
