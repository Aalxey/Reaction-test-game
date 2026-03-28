import requests

url = "http://localhost:8000/api/auth/login/"
data = {
    "username": "wronguser",
    "password": "wrongpassword"
}

response = requests.post(url, json=data)
print(f"Status Code: {response.status_code}")
print(f"Response Body: {response.text}")
print(f"Content Length: {len(response.text)}")
