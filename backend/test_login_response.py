import urllib.request
import json

url = 'http://localhost:8000/api/auth/login/'
data = {
    'username': 'admin',
    'password': 'admin'
}
json_data = json.dumps(data).encode('utf-8')

req = urllib.request.Request(url, data=json_data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        status = response.getcode()
        body = response.read().decode('utf-8')
        print(f"Status Code: {status}")
        print(f"Response Body: {body}")
except Exception as e:
    print(f"Error: {e}")
