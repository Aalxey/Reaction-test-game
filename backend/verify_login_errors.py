import requests

BASE_URL = "http://localhost:8000/api/auth/login/"

def test_login(username, password, expected_status, expected_error):
    print(f"Testing {username}:{password} -> Expected {expected_status}")
    try:
        response = requests.post(BASE_URL, json={"username": username, "password": password})
        print(f"Status: {response.status_code}")
        data = response.json()
        print(f"Response: {data}")
        if response.status_code == expected_status and expected_error in data.get('error', ''):
            print("SUCCESS")
        else:
            print("FAILURE")
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 20)

# 1. User not found (404)
test_login("NonExistentUser", "AnyPass", 404, "User does not exist")

# 2. Incorrect password for user 'Hari' (401)
test_login("Hari", "WrongPass123", 401, "Incorrect password")

# 3. Successful login would return 200, but we don't know Hari's password here.
# Assuming 'Hari' is active as checked before.
