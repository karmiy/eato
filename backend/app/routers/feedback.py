from fastapi import APIRouter, HTTPException
from typing import List
from app.config import get_supabase
from app.models import FeedbackCreate, Feedback

router = APIRouter(prefix="/feedback", tags=["用餐反馈"])

@router.get("/{user_id}", response_model=List[Feedback])
async def get_feedback(user_id: str):
    """获取用户的反馈记录"""
    supabase = get_supabase()
    result = supabase.table("feedback").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return result.data

@router.post("/", response_model=Feedback)
async def add_feedback(feedback: FeedbackCreate):
    """添加用餐反馈"""
    supabase = get_supabase()
    result = supabase.table("feedback").insert(feedback.dict()).execute()
    return result.data[0]

@router.get("/restaurant/{user_id}/{restaurant_id}", response_model=List[Feedback])
async def get_restaurant_feedback(user_id: str, restaurant_id: str):
    """获取某餐厅的反馈记录"""
    supabase = get_supabase()
    result = supabase.table("feedback").select("*").eq("user_id", user_id).eq("restaurant_id", restaurant_id).execute()
    return result.data

