import urllib.request
import json

# Replace with the token from the admin login test or just try to login again to get a fresh one
login_url = 'http://localhost:8000/api/auth/login/'
login_data = json.dumps({'username': 'admin', 'password': 'admin'}).encode('utf-8')
login_req = urllib.request.Request(login_url, data=login_data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(login_req) as login_res:
        auth_data = json.loads(login_res.read().decode('utf-8'))
        token = auth_data['token']
        print(f"Token obtained: {token[:10]}...")

        list_url = 'http://localhost:8000/api/accounts/admin/users/'
        list_req = urllib.request.Request(list_url, headers={
            'Authorization': f'Token {token}',
            'Content-Type': 'application/json'
        })

        with urllib.request.urlopen(list_req) as list_res:
            users = json.loads(list_res.read().decode('utf-8'))
            print(f"Users found: {len(users)}")
            for user in users:
                print(f"- {user['username']} (id: {user['id']})")
except Exception as e:
    print(f"Error: {e}")
