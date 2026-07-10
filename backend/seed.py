import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

URL = os.environ.get("SUPABASE_URL")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not URL or not KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.")

supabase: Client = create_client(URL, KEY)

campaigns = [
    {
        "title": 'Essential Premium Tee',
        "description": 'High-quality organic cotton t-shirt with a perfect fit. Made from sustainably sourced materials, GOTS certified.',
        "price": 12.99,
        "targetCount": 100,
        "currentCount": 85,
        "status": 'active',
        "imageUrl": None,
        "endDate": (datetime.now() + timedelta(days=7)).isoformat(),
    },
    {
        "title": 'Heavyweight Hoodie',
        "description": 'Ultra-soft 400gsm heavyweight hoodie for the winter season. Dropped shoulders, brushed fleece lining, kangaroo pocket.',
        "price": 34.50,
        "targetCount": 50,
        "currentCount": 20,
        "status": 'active',
        "imageUrl": None,
        "endDate": (datetime.now() + timedelta(days=14)).isoformat(),
    },
    {
        "title": 'Athletic Joggers',
        "description": 'Comfortable and stylish joggers for workouts or lounging. 4-way stretch fabric, deep side pockets, tapered ankle.',
        "price": 22.00,
        "targetCount": 200,
        "currentCount": 195,
        "status": 'active',
        "imageUrl": None,
        "endDate": (datetime.now() + timedelta(days=2)).isoformat(),
    },
    {
        "title": 'Classic Oxford Shirt',
        "description": 'Timeless Oxford weave shirt in a relaxed fit. Perfect for smart-casual outfits. Wrinkle-resistant, breathable.',
        "price": 27.50,
        "targetCount": 75,
        "currentCount": 10,
        "status": 'active',
        "imageUrl": None,
        "endDate": (datetime.now() + timedelta(days=21)).isoformat(),
    },
    {
        "title": 'Cargo Shorts',
        "description": 'Durable multi-pocket cargo shorts with a modern tapered fit. Water-resistant ripstop nylon, zip security pocket.',
        "price": 18.00,
        "targetCount": 150,
        "currentCount": 60,
        "status": 'active',
        "imageUrl": None,
        "endDate": (datetime.now() + timedelta(days=10)).isoformat(),
    },
    {
        "title": 'Merino Wool Socks 3-Pack',
        "description": 'Premium Merino wool socks — warm in winter, cool in summer. Cushioned sole, seamless toe, anti-blister design.',
        "price": 9.99,
        "targetCount": 300,
        "currentCount": 212,
        "status": 'active',
        "imageUrl": None,
        "endDate": (datetime.now() + timedelta(days=5)).isoformat(),
    },
]

def seed():
    print('🌱 Seeding database via Supabase Python Client...')

    # Delete all orders first (foreign key constraint)
    # Using a dummy filter to delete all since supabase-py requires a filter for delete
    del_orders = supabase.table("Order").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print('⚠️  Orders cleared')

    # Delete all campaigns
    del_campaigns = supabase.table("Campaign").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
    print('⚠️  Campaigns cleared')

    try:
        response = supabase.table("Campaign").insert(campaigns).execute()
        data = response.data
        print(f'✅ Seeded {len(data)} campaigns successfully:')
        for c in data:
            print(f"   • {c['title']} ({c['currentCount']}/{c['targetCount']})")
    except Exception as e:
        print('❌ Seed failed:', str(e))
        print('Hint: Make sure you have run the schema.sql in your Supabase SQL Editor first.')

if __name__ == "__main__":
    seed()
