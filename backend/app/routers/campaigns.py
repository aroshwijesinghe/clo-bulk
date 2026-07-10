from fastapi import APIRouter, HTTPException
from typing import List
from ..database import supabase
from ..schemas import CampaignCreate, CampaignUpdate

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])

@router.get("/")
def get_campaigns():
    try:
        response = supabase.table("Campaign").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{campaign_id}")
def get_campaign(campaign_id: str):
    try:
        response = supabase.table("Campaign").select("*, Order(*)").eq("id", campaign_id).single().execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/")
def create_campaign(campaign: CampaignCreate):
    try:
        data = campaign.model_dump(exclude_unset=True)
        response = supabase.table("Campaign").insert(data).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{campaign_id}")
def update_campaign(campaign_id: str, campaign: CampaignUpdate):
    try:
        data = campaign.model_dump(exclude_unset=True)
        response = supabase.table("Campaign").update(data).eq("id", campaign_id).execute()
        return response.data[0] if response.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: str):
    try:
        response = supabase.table("Campaign").delete().eq("id", campaign_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
