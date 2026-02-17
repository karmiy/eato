-- ============================================
-- Eato 数据库 Schema
-- 在 Supabase SQL Editor 中执行
-- ============================================

-- 成员表（吃货档案）
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,                          -- 用户ID（小程序openid）
  name TEXT NOT NULL,                             -- 成员名称
  avatar TEXT,                                    -- 头像URL
  taste_preferences JSONB DEFAULT '{}',           -- 口味偏好 {spicy, sweet, sour, oily}
  cuisine_preferences TEXT[] DEFAULT '{}',        -- 菜系偏好
  dietary_restrictions TEXT[] DEFAULT '{}',       -- 饮食禁忌
  budget_min INTEGER,                             -- 最低预算
  budget_max INTEGER,                             -- 最高预算
  notes TEXT,                                     -- 其他备注（新增）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  restaurant_data JSONB,                          -- 餐厅详细信息
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)                  -- 防止重复收藏
);

-- 黑名单表
CREATE TABLE IF NOT EXISTS blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  reason TEXT,                                    -- 拉黑原因
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- 用餐反馈表
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),  -- 评分 1-5
  comment TEXT,                                   -- 评价内容
  visited_at DATE,                                -- 用餐日期
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引（提高查询性能）
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_blacklist_user_id ON blacklist(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);

