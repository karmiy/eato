from fastapi import APIRouter, HTTPException
from typing import List
from app.config import get_supabase
from app.models import FavoriteCreate, Favorite

router = APIRouter(prefix="/favorites", tags=["收藏管理"])

@router.get("/{user_id}", response_model=List[Favorite])
async def get_favorites(user_id: str):
    """获取用户的收藏列表"""
    supabase = get_supabase()
    result = supabase.table("favorites").select("*").eq("user_id", user_id).execute()
    return result.data

@router.post("/", response_model=Favorite)
async def add_favorite(favorite: FavoriteCreate):
    """添加收藏"""
    supabase = get_supabase()
    # 检查是否已收藏
    existing = supabase.table("favorites").select("*").eq("user_id", favorite.user_id).eq("restaurant_id", favorite.restaurant_id).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="已收藏")
    
    result = supabase.table("favorites").insert(favorite.dict()).execute()
    return result.data[0]

@router.delete("/{favorite_id}")
async def remove_favorite(favorite_id: str):
    """取消收藏"""
    supabase = get_supabase()
    supabase.table("favorites").delete().eq("id", favorite_id).execute()
    return {"message": "取消收藏成功"}

@router.delete("/restaurant/{user_id}/{restaurant_id}")
async def remove_favorite_by_restaurant(user_id: str, restaurant_id: str):
    """按餐厅ID取消收藏"""
    supabase = get_supabase()
    supabase.table("favorites").delete().eq("user_id", user_id).eq("restaurant_id", restaurant_id).execute()
    return {"message": "取消收藏成功"}

