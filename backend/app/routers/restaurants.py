"""
餐厅相关接口
"""
from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
from ..services.amap import amap_service
from ..services.ai import ai_service

router = APIRouter(prefix="/api/restaurants", tags=["餐厅"])


@router.get("/nearby")
async def get_nearby_restaurants(
    longitude: float = Query(..., description="经度"),
    latitude: float = Query(..., description="纬度"),
    radius: int = Query(3000, description="搜索半径（米）"),
    keywords: Optional[str] = Query(None, description="关键词，如'火锅'")
):
    """
    搜索附近餐厅（测试接口）
    
    直接调用高德 API，用于测试高德服务是否正常
    """
    try:
        restaurants = await amap_service.search_nearby_restaurants(
            longitude=longitude,
            latitude=latitude,
            radius=radius,
            keywords=keywords
        )
        return {
            "count": len(restaurants),
            "restaurants": restaurants
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/geocode")
async def reverse_geocode(
    longitude: float = Query(..., description="经度"),
    latitude: float = Query(..., description="纬度")
):
    """
    逆地理编码：坐标转地址
    """
    try:
        result = await amap_service.reverse_geocode(longitude, latitude)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ai-rank")
async def ai_rank_restaurants(
    members: List[Dict[str, Any]] = Body(..., description="成员列表"),
    restaurants: List[Dict[str, Any]] = Body(..., description="餐厅列表")
):
    """
    AI 智能排序餐厅（测试接口）

    直接调用 AI 服务，用于测试 qwen-turbo 是否正常
    """
    try:
        rankings = await ai_service.rank_restaurants(
            members=members,
            restaurants=restaurants
        )
        return {
            "count": len(rankings),
            "rankings": rankings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

