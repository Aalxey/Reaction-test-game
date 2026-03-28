from django.test import Client
from django.contrib.auth.models import User
import json

client = Client()

def test_login(username, password, expected_status, expected_error):
    print(f"Testing {username}:{password} -> Expected {expected_status}")
    response = client.post('/api/auth/login/', 
                           data=json.dumps({"username": username, "password": password}),
                           content_type='application/json')
    
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {data}")
    
    if response.status_code == expected_status and expected_error in data.get('error', ''):
        print("SUCCESS")
    else:
        print("FAILURE")
    print("-" * 20)

# 1. User not found (404)
test_login("NonExistentUser", "AnyPass", 404, "User does not exist")

# 2. Incorrect password for user 'Hari' (401)
# Ensure Hari exists for this test (though we checked earlier, we can create if missing in a real test environment)
test_login("Hari", "WrongPass123", 401, "Incorrect password")
