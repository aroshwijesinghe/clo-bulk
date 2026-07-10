import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

URL = os.environ.get("SUPABASE_URL")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not URL or not KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.")

# Create the Supabase client using the service role key to bypass RLS in backend logic if needed,
# or for standard operations.
supabase: Client = create_client(URL, KEY)
