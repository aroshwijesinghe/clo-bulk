import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

URL = os.environ.get("SUPABASE_URL")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not URL or not KEY:
    print("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

supabase: Client = create_client(URL, KEY)

users_to_create = [
    {"email": "admin@example.com", "password": "admin123", "name": "Admin User"},
    {"email": "user@example.com", "password": "user123", "name": "Test User"},
    {"email": "developers11@gmail.com", "password": "password123", "name": "Developer"}
]

def create_users():
    for u in users_to_create:
        try:
            print(f"Attempting to create {u['email']}...")
            res = supabase.auth.admin.create_user({
                "email": u['email'],
                "password": u['password'],
                "email_confirm": True,
                "user_metadata": {"full_name": u['name']}
            })
            print(f"Created {u['email']}")
        except Exception as e:
            if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                print(f"User {u['email']} already exists.")
            else:
                print(f"Failed to create {u['email']}: {e}")

if __name__ == "__main__":
    create_users()
