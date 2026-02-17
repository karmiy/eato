"""
AI 推荐服务 - 通义千问 (qwen-turbo)
负责智能排序餐厅推荐
"""
import httpx
import json
from typing import List, Dict, Any, Optional
from ..config import QWEN_API_KEY

QWEN_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"

SYSTEM_PROMPT = """你是一个专业的餐厅推荐助手。根据用餐成员的偏好，对候选餐厅进行评分和排序。

评分规则：
1. 0-100分，100分最高
2. 综合考虑：
   - 菜系匹配度（成员喜欢的菜系优先）
   - 口味偏好（辣度是否符合成员需求）
   - 饮食禁忌（必须避开成员的忌口）
   - 特殊需求（如减肥、聚餐、约会等）
   - 预算匹配度（人均消费是否合适）
3. 如果有成员偏好冲突，找到大家都能接受的平衡点
4. 根据餐厅名称和类型推断菜品特点

输出要求：
- 只输出 JSON 数组，不要其他内容
- 格式：[{"id":"餐厅ID","score":分数,"reason":"推荐理由"}]
- 按分数从高到低排序

推荐理由(reason)写作规范：
- 40-80字，语句通顺完整
- 必须包含：餐厅特色（如菜系、招牌菜、口碑）
- 必须具体说明：对每位成员的匹配点
- 如果只有1位成员：说明该成员的哪些偏好被满足
- 如果有多位成员：分别提及每位成员（用顿号分隔），或说明共同匹配点
- 示例（1人）："这家川菜馆以麻辣鲜香著称，完美契合小明对川菜的偏好，评分4.5且人均适中。"
- 示例（2人）："川湘风味兼具，小明喜欢的川菜、小红偏爱的湘菜都能满足，评分高达4.6分。"
- 禁止出现不完整的句子如"XX和都喜欢"""


class AIService:
    """AI 推荐服务"""

    def __init__(self):
        self.api_key = QWEN_API_KEY

    async def rank_restaurants(
        self,
        members: List[Dict[str, Any]],
        restaurants: List[Dict[str, Any]],
        max_results: int = 10,
        user_cuisines: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        AI 智能排序餐厅

        Args:
            members: 成员列表，每个包含 {name, cuisines, restrictions, spicy_level, notes}
            restaurants: 餐厅列表，每个包含 {id, name, type, cost, rating}
            max_results: 返回结果数量
            user_cuisines: 用户选择的菜系偏好（优先于成员偏好）

        Returns:
            排序后的餐厅列表，每个包含 {id, score, reason}
        """
        # 构建用户消息
        user_message = self._build_prompt(members, restaurants, user_cuisines)

        # 调用通义千问 API
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "qwen-turbo",
            "input": {
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ]
            },
            "parameters": {
                "result_format": "message",
                "temperature": 0.3,  # 低温度，更稳定
                "max_tokens": 1000
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                QWEN_API_URL,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            data = response.json()

        # 解析 AI 响应
        try:
            content = data["output"]["choices"][0]["message"]["content"]
            # 提取 JSON 部分（AI 可能会加一些额外文字）
            content = content.strip()
            if content.startswith("```"):
                # 去掉 markdown 代码块
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
            
            rankings = json.loads(content)
            return rankings[:max_results]
        except (KeyError, json.JSONDecodeError) as e:
            raise Exception(f"AI 响应解析失败: {e}, 原始响应: {data}")

    def _build_prompt(
        self,
        members: List[Dict[str, Any]],
        restaurants: List[Dict[str, Any]],
        user_cuisines: Optional[List[str]] = None
    ) -> str:
        """构建精简的 prompt"""
        # 用户指定的菜系偏好（最高优先级）
        user_pref = ""
        if user_cuisines and len(user_cuisines) > 0:
            user_pref = f"【用户本次指定菜系】：{','.join(user_cuisines)}（最高优先级，必须优先匹配这些菜系）\n\n"

        # 成员信息（精简版）
        members_info = []
        for m in members:
            info = {"name": m.get("name", "未知")}
            # 兼容两种字段名：数据库字段名和简化字段名
            cuisines = m.get("cuisine_preferences") or m.get("cuisines")
            if cuisines:
                info["喜欢"] = cuisines
            restrictions = m.get("dietary_restrictions") or m.get("restrictions")
            if restrictions:
                info["忌口"] = restrictions
            # 从 taste_preferences 提取辣度
            taste = m.get("taste_preferences") or {}
            spicy = taste.get("spicy") if isinstance(taste, dict) else m.get("spicy_level")
            if spicy is not None:
                spicy_map = {1: "不吃辣", 2: "微辣", 3: "中辣", 4: "重辣", 5: "特辣"}
                info["辣度"] = spicy_map.get(spicy, "不限")
            if m.get("notes"):
                info["备注"] = m["notes"]
            members_info.append(info)

        # 餐厅信息（精简版）
        restaurants_info = []
        for r in restaurants:
            info = {
                "id": r["id"],
                "name": r["name"],
                "type": r.get("type", "餐厅")
            }
            if r.get("cost"):
                info["人均"] = r["cost"]
            if r.get("rating"):
                info["评分"] = r["rating"]
            restaurants_info.append(info)

        return f"{user_pref}成员：{json.dumps(members_info, ensure_ascii=False)}\n餐厅：{json.dumps(restaurants_info, ensure_ascii=False)}"


# 单例
ai_service = AIService()

