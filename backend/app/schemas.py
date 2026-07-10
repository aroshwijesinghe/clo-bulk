from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class CampaignCreate(BaseModel):
    title: str
    description: str
    price: float
    targetCount: int
    endDate: str
    imageUrl: Optional[str] = None
    status: Optional[str] = "active"
    currentCount: Optional[int] = 0
    createdBy: Optional[str] = None

class CampaignUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    targetCount: Optional[int] = None
    currentCount: Optional[int] = None
    status: Optional[str] = None
    imageUrl: Optional[str] = None
    endDate: Optional[str] = None

class OrderCreate(BaseModel):
    campaignId: str
    quantity: int
    size: str
    userId: Optional[str] = None
