from fastapi import APIRouter, HTTPException
from ..database import supabase
from ..schemas import OrderCreate

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.get("/")
def get_orders():
    try:
        response = supabase.table("Order").select("*, Campaign(title, price, imageUrl)").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
def create_order(order: OrderCreate):
    try:
        data = order.model_dump(exclude_unset=True)
        response = supabase.table("Order").insert(data).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
