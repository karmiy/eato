from fastapi import APIRouter, HTTPException
from typing import List
from app.config import get_supabase
from app.models import BlacklistCreate, Blacklist

router = APIRouter(prefix="/blacklist", tags=["黑名单管理"])

@router.get("/{user_id}", response_model=List[Blacklist])
async def get_blacklist(user_id: str):
    """获取用户的黑名单"""
    supabase = get_supabase()
    result = supabase.table("blacklist").select("*").eq("user_id", user_id).execute()
    return result.data

@router.post("/", response_model=Blacklist)
async def add_to_blacklist(item: BlacklistCreate):
    """添加到黑名单"""
    supabase = get_supabase()
    # 检查是否已在黑名单
    existing = supabase.table("blacklist").select("*").eq("user_id", item.user_id).eq("restaurant_id", item.restaurant_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="已在黑名单中")
    
    result = supabase.table("blacklist").insert(item.dict()).execute()
    return result.data[0]

@router.delete("/{blacklist_id}")
async def remove_from_blacklist(blacklist_id: str):
    """从黑名单移除"""
    supabase = get_supabase()
    supabase.table("blacklist").delete().eq("id", blacklist_id).execute()
    return {"message": "移除成功"}

@router.delete("/restaurant/{user_id}/{restaurant_id}")
async def remove_from_blacklist_by_restaurant(user_id: str, restaurant_id: str):
    """按餐厅ID从黑名单移除"""
    supabase = get_supabase()
    supabase.table("blacklist").delete().eq("user_id", user_id).eq("restaurant_id", restaurant_id).execute()
    return {"message": "移除成功"}

