import requests

url = "http://localhost:8000/api/auth/register/"
data = {
    "username": "Hari",
    "email": "hari@example.com",
    "password": "Password123"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
