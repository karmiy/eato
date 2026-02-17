from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

# ========== 成员相关 ==========
class TastePreferences(BaseModel):
    spicy: int = 3      # 辣度 1-5
    sweet: int = 3      # 甜度 1-5
    sour: int = 3       # 酸度 1-5
    oily: int = 3       # 油腻 1-5

    class Config:
        extra = "allow"

class MemberCreate(BaseModel):
    user_id: str
    name: str
    avatar: Optional[str] = None
    taste_preferences: Optional[TastePreferences] = None
    cuisine_preferences: List[str] = []     # 菜系偏好
    dietary_restrictions: List[str] = []    # 饮食禁忌
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    notes: Optional[str] = None             # 其他备注

    class Config:
        extra = "allow"

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    taste_preferences: Optional[TastePreferences] = None
    cuisine_preferences: Optional[List[str]] = None
    dietary_restrictions: Optional[List[str]] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    notes: Optional[str] = None             # 其他备注

    class Config:
        extra = "allow"

class Member(MemberCreate):
    id: str
    created_at: Any  # 兼容字符串和 datetime

# ========== 收藏相关 ==========
class FavoriteCreate(BaseModel):
    user_id: str
    restaurant_id: str
    restaurant_name: str
    restaurant_data: Optional[dict] = None

    class Config:
        extra = "allow"

class Favorite(FavoriteCreate):
    id: str
    created_at: Any

# ========== 黑名单相关 ==========
class BlacklistCreate(BaseModel):
    user_id: str
    restaurant_id: str
    restaurant_name: str

    class Config:
        extra = "allow"

class Blacklist(BlacklistCreate):
    id: str
    created_at: Any

# ========== 反馈相关 ==========
class FeedbackCreate(BaseModel):
    user_id: str
    restaurant_id: str
    restaurant_name: str
    rating: int  # 1=不好, 2=一般, 3=很好
    visited_at: Optional[str] = None

    class Config:
        extra = "allow"

class Feedback(FeedbackCreate):
    id: str
    created_at: Any

