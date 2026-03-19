import os
import requests
from dotenv import load_dotenv

load_dotenv()
res = requests.post(f"{os.getenv('SUPABASE_URL')}/auth/v1/signup", headers={'apikey': os.getenv('SUPABASE_ANON_KEY')}, json={'email': 'testbot666@example.com', 'password': 'password123'})
data = res.json()
token = data.get('access_token')
user_id = data.get('user', {}).get('id')
print('User ID:', user_id)

if token:
    headers = {
        'apikey': os.getenv('SUPABASE_ANON_KEY'),
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    # Insert with fake password hash
    res_users = requests.post(f"{os.getenv('SUPABASE_URL')}/rest/v1/users", headers=headers, json={'id': user_id, 'email': 'testbot666@example.com', 'password_hash': 'fakehash'})
    print('USER INSERT:', res_users.status_code, res_users.text)

    # Now emotions table with token
    insert_res = requests.post(f"{os.getenv('SUPABASE_URL')}/rest/v1/emotions", headers=headers, json={'user_id': user_id, 'emotion': 'Happy', 'confidence': 0.99})
    print('EMOTION INSERT:', insert_res.text)
