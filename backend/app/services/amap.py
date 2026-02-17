"""
高德地图 API 服务
- POI 搜索（搜索附近餐厅）
- 逆地理编码（坐标转地址，备用）
"""
import httpx
import json
from typing import List, Optional
from ..config import AMAP_KEY

AMAP_BASE_URL = "https://restapi.amap.com/v3"


class AmapService:
    """高德地图服务"""

    def __init__(self):
        self.key = AMAP_KEY

    async def search_nearby_restaurants(
        self,
        longitude: float,
        latitude: float,
        radius: int = 3000,
        keywords: Optional[str] = None,
        types: str = "050000",  # 餐饮服务大类
        page: int = 1,
        page_size: int = 50
    ) -> List[dict]:
        """
        搜索附近餐厅

        Args:
            longitude: 经度
            latitude: 纬度
            radius: 搜索半径（米），默认 3km
            keywords: 关键词（如"火锅"），可选
            types: POI 类型，050000=餐饮服务
            page: 页码
            page_size: 每页数量（最大 50）

        Returns:
            餐厅列表，每个包含 {id, name, type, address, location, tel, rating, cost, distance}
        """
        location = f"{longitude},{latitude}"

        params = {
            "key": self.key,
            "location": location,
            "radius": radius,
            "types": types,
            "offset": page_size,
            "page": page,
            "extensions": "all",  # 返回详细信息
            "sortrule": "distance"  # 按距离排序
        }

        if keywords:
            params["keywords"] = keywords

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{AMAP_BASE_URL}/place/around",
                params=params
            )
            response.raise_for_status()
            data = response.json()

        if data.get("status") != "1":
            raise Exception(f"高德 API 错误: {data.get('info')}")

        pois = data.get("pois", [])
        print(f"\n{'='*60}")
        print(f"📍 高德搜索: location={location}, radius={radius}m")
        print(f"📦 返回 {len(pois)} 个结果")

        # 打印前 3 个原始数据
        for i, poi in enumerate(pois[:3]):
            print(f"\n--- POI {i+1}: {poi.get('name')} ---")
            print(json.dumps(poi, ensure_ascii=False, indent=2))
        print(f"{'='*60}\n")

        # 解析并返回标准化的餐厅列表
        restaurants = []
        for poi in pois:
            restaurants.append(self._parse_poi(poi))

        return restaurants

    def _parse_poi(self, poi: dict) -> dict:
        """解析 POI 数据为标准格式"""
        # 提取菜系类型（如 "餐饮服务;中餐厅;川菜" -> "川菜"）
        type_parts = poi.get("type", "").split(";")
        cuisine_type = type_parts[-1] if type_parts else "餐厅"

        # 解析人均消费
        cost = None
        if poi.get("biz_ext", {}).get("cost"):
            try:
                cost = int(float(poi["biz_ext"]["cost"]))
            except (ValueError, TypeError):
                pass

        # 解析评分
        rating = None
        if poi.get("biz_ext", {}).get("rating"):
            try:
                rating = float(poi["biz_ext"]["rating"])
            except (ValueError, TypeError):
                pass

        # 解析营业时间
        biz_ext = poi.get("biz_ext", {})
        opentime = biz_ext.get("opentime2") or biz_ext.get("opentime", "")

        # 解析特色菜品标签
        tag = poi.get("tag", "")
        if isinstance(tag, list):
            tag = ",".join(tag)
        tags = [t.strip() for t in tag.split(",") if t.strip()][:8]  # 最多8个标签

        # 关键标签（菜系）
        keytag = poi.get("keytag", "")

        return {
            "id": poi.get("id"),
            "name": poi.get("name"),
            "type": cuisine_type,
            "type_full": poi.get("type"),
            "keytag": keytag,  # 关键标签如"北京菜"
            "tags": tags,  # 特色菜品列表
            "address": poi.get("address"),
            "pname": poi.get("pname"),  # 省份
            "cityname": poi.get("cityname"),  # 城市
            "adname": poi.get("adname"),  # 区县
            "business_area": poi.get("business_area", ""),  # 商圈
            "location": poi.get("location"),  # "经度,纬度"
            "tel": poi.get("tel"),
            "rating": rating,
            "cost": cost,
            "distance": int(poi.get("distance", 0)),
            "photos": [p.get("url") for p in poi.get("photos", [])[:3]],  # 最多3张图
            "opentime": opentime  # 营业时间
        }

    async def reverse_geocode(self, longitude: float, latitude: float) -> dict:
        """
        逆地理编码：坐标转地址

        Returns:
            {address, city, district, street}
        """
        params = {
            "key": self.key,
            "location": f"{longitude},{latitude}",
            "extensions": "base"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{AMAP_BASE_URL}/geocode/regeo",
                params=params
            )
            response.raise_for_status()
            data = response.json()

        if data.get("status") != "1":
            raise Exception(f"高德 API 错误: {data.get('info')}")

        regeo = data.get("regeocode", {})
        addr_component = regeo.get("addressComponent", {})

        return {
            "address": regeo.get("formatted_address"),
            "city": addr_component.get("city") or addr_component.get("province"),
            "district": addr_component.get("district"),
            "street": addr_component.get("streetNumber", {}).get("street")
        }


# 单例
amap_service = AmapService()

