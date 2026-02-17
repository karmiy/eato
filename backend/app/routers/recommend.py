"""
推荐接口
"""
from fastapi import APIRouter, HTTPException, Body
from typing import List, Optional
from pydantic import BaseModel
from ..services.recommend import recommend_service

router = APIRouter(prefix="/api/recommend", tags=["推荐"])


class RecommendRequest(BaseModel):
    """推荐请求"""
    user_id: str
    member_ids: List[str]
    latitude: float
    longitude: float
    radius: int = 3000
    budget_min: Optional[int] = None  # 最低预算
    budget_max: Optional[int] = None  # 最高预算
    cuisines: Optional[List[str]] = None  # 用户选择的菜系偏好


@router.post("")
async def get_recommendation(req: RecommendRequest):
    """
    获取餐厅推荐

    第一次调用：调用高德 + AI，返回第一个推荐
    后续调用（换一家）：从缓存取下一个，不消耗 AI token

    缓存失效条件：
    - 位置变化超过 1km
    - 成员组合变化
    - 超过 1 小时
    - 列表用完
    """
    try:
        result = await recommend_service.get_recommendation(
            user_id=req.user_id,
            member_ids=req.member_ids,
            latitude=req.latitude,
            longitude=req.longitude,
            radius=req.radius,
            budget_min=req.budget_min,
            budget_max=req.budget_max,
            cuisines=req.cuisines
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/refresh")
async def refresh_recommendation(req: RecommendRequest):
    """
    强制刷新推荐（忽略缓存）

    当用户想要完全不同的推荐时使用
    """
    try:
        result = await recommend_service.get_recommendation(
            user_id=req.user_id,
            member_ids=req.member_ids,
            latitude=req.latitude,
            longitude=req.longitude,
            radius=req.radius,
            budget_min=req.budget_min,
            budget_max=req.budget_max,
            cuisines=req.cuisines,
            use_cache=False
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

