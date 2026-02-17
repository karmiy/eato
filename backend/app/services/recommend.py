"""
餐厅推荐服务
整合：代码过滤 + AI 排序 + 缓存策略
"""
import hashlib
import time
from typing import List, Dict, Any, Optional
from .amap import amap_service
from .ai import ai_service
from ..config import get_supabase


class RecommendCache:
    """推荐结果缓存（内存缓存，生产环境可换 Redis）"""
    
    def __init__(self, ttl: int = 3600):
        self.cache: Dict[str, Dict] = {}
        self.ttl = ttl  # 缓存过期时间（秒）
    
    def _make_key(self, user_id: str, member_ids: List[str], lat: float, lng: float) -> str:
        """生成缓存 key"""
        # 成员 ID 排序后拼接
        members_str = ",".join(sorted(member_ids))
        # 位置精确到小数点后 2 位（约 1km 精度）
        location_str = f"{lat:.2f},{lng:.2f}"
        raw_key = f"{user_id}:{members_str}:{location_str}"
        return hashlib.md5(raw_key.encode()).hexdigest()
    
    def get(self, user_id: str, member_ids: List[str], lat: float, lng: float) -> Optional[Dict]:
        """获取缓存"""
        key = self._make_key(user_id, member_ids, lat, lng)
        if key not in self.cache:
            return None
        
        entry = self.cache[key]
        # 检查是否过期
        if time.time() - entry["created_at"] > self.ttl:
            del self.cache[key]
            return None
        
        return entry
    
    def set(self, user_id: str, member_ids: List[str], lat: float, lng: float, 
            rankings: List[Dict], restaurants: Dict[str, Dict]):
        """设置缓存"""
        key = self._make_key(user_id, member_ids, lat, lng)
        self.cache[key] = {
            "rankings": rankings,
            "restaurants": restaurants,  # id -> 完整餐厅信息
            "current_index": 0,
            "created_at": time.time()
        }
    
    def get_next(self, user_id: str, member_ids: List[str], lat: float, lng: float) -> Optional[Dict]:
        """获取下一个推荐（换一家）"""
        key = self._make_key(user_id, member_ids, lat, lng)
        if key not in self.cache:
            return None
        
        entry = self.cache[key]
        # 检查是否过期
        if time.time() - entry["created_at"] > self.ttl:
            del self.cache[key]
            return None
        
        # 检查是否还有下一个
        if entry["current_index"] >= len(entry["rankings"]):
            return None  # 列表用完
        
        # 获取当前推荐
        ranking = entry["rankings"][entry["current_index"]]
        restaurant = entry["restaurants"].get(ranking["id"])
        
        # 移动指针
        entry["current_index"] += 1
        
        if restaurant:
            return {
                **restaurant,
                "score": ranking["score"],
                "reason": ranking["reason"]
            }
        return None


# 全局缓存实例
recommend_cache = RecommendCache()


class RecommendService:
    """推荐服务"""
    
    async def get_recommendation(
        self,
        user_id: str,
        member_ids: List[str],
        latitude: float,
        longitude: float,
        radius: int = 3000,
        budget_min: Optional[int] = None,
        budget_max: Optional[int] = None,
        cuisines: Optional[List[str]] = None,
        use_cache: bool = True
    ) -> Dict[str, Any]:
        """
        获取餐厅推荐

        Args:
            user_id: 用户 ID
            member_ids: 参与成员 ID 列表
            latitude: 纬度
            longitude: 经度
            radius: 搜索半径（米）
            budget_min: 最低预算（人均）
            budget_max: 最大预算（人均）
            cuisines: 用户选择的菜系偏好（优先于成员偏好）
            use_cache: 是否使用缓存

        Returns:
            {restaurant: 推荐餐厅, remaining: 剩余数量, from_cache: 是否来自缓存}
        """
        # 1. 尝试从缓存获取
        if use_cache:
            cached = recommend_cache.get_next(user_id, member_ids, latitude, longitude)
            if cached:
                cache_entry = recommend_cache.get(user_id, member_ids, latitude, longitude)
                remaining = len(cache_entry["rankings"]) - cache_entry["current_index"]
                return {
                    "restaurant": cached,
                    "remaining": remaining,
                    "from_cache": True
                }
        
        # 2. 获取成员信息
        members = await self._get_members(member_ids)
        if not members:
            raise Exception("未找到成员信息")
        
        # 3. 获取黑名单
        blacklist = await self._get_blacklist(user_id)
        blacklist_names = {item["restaurant_name"] for item in blacklist}
        
        # 4. 调用高德 API 获取附近餐厅
        restaurants = await amap_service.search_nearby_restaurants(
            longitude=longitude,
            latitude=latitude,
            radius=radius
        )
        
        # 5. 代码硬过滤
        filtered = []
        for r in restaurants:
            # 过滤黑名单
            if r["name"] in blacklist_names:
                continue
            # 过滤预算（上限）
            if budget_max and r.get("cost") and r["cost"] > budget_max:
                continue
            # 过滤预算（下限）
            if budget_min and r.get("cost") and r["cost"] < budget_min:
                continue
            filtered.append(r)
        
        if not filtered:
            raise Exception("没有符合条件的餐厅")
        
        # 6. 限制候选数量（省 token）
        candidates = filtered[:15]
        
        # 7. AI 排序（传入用户选择的菜系偏好）
        rankings = await ai_service.rank_restaurants(
            members=members,
            restaurants=candidates,
            user_cuisines=cuisines  # 用户选择的菜系优先
        )
        
        # 8. 构建餐厅字典
        restaurants_dict = {r["id"]: r for r in candidates}
        
        # 9. 存入缓存
        recommend_cache.set(
            user_id, member_ids, latitude, longitude,
            rankings, restaurants_dict
        )
        
        # 10. 返回第一个推荐
        result = recommend_cache.get_next(user_id, member_ids, latitude, longitude)
        if result:
            cache_entry = recommend_cache.get(user_id, member_ids, latitude, longitude)
            remaining = len(cache_entry["rankings"]) - cache_entry["current_index"]
            return {
                "restaurant": result,
                "remaining": remaining,
                "from_cache": False
            }
        return {"restaurant": None, "remaining": 0, "from_cache": False}

    async def _get_members(self, member_ids: List[str]) -> List[Dict]:
        """从数据库获取成员信息"""
        supabase = get_supabase()
        members = []
        for mid in member_ids:
            result = supabase.table("members").select("*").eq("id", mid).execute()
            if result.data:
                members.append(result.data[0])
        return members

    async def _get_blacklist(self, user_id: str) -> List[Dict]:
        """从数据库获取黑名单"""
        supabase = get_supabase()
        result = supabase.table("blacklist").select("*").eq("user_id", user_id).execute()
        return result.data or []


# 单例
recommend_service = RecommendService()

