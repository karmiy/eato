# Eato 后端服务

基于 FastAPI + Supabase 的后端 API 服务。

## 环境要求

- Python 3.10+
- pip

## 首次安装

```bash
cd backend

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows PowerShell:
.\venv\Scripts\Activate
# Mac/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

## 配置

复制 `.env.example` 为 `.env`，填入 Supabase 配置：

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=sb_secret_xxx
```

## 启动服务

```bash
# 激活虚拟环境（如未激活）
.\venv\Scripts\Activate  # Windows
source venv/bin/activate  # Mac/Linux

# 启动开发服务器
uvicorn app.main:app --reload
```

服务启动后：
- API 地址: http://localhost:8000
- Swagger 文档: http://localhost:8000/docs
- ReDoc 文档: http://localhost:8000/redoc

## API 接口

### 成员管理 `/api/members`
| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/members/{user_id}` | 获取成员列表 |
| POST | `/api/members` | 创建成员 |
| PUT | `/api/members/{member_id}` | 更新成员 |
| DELETE | `/api/members/{member_id}` | 删除成员 |

### 收藏管理 `/api/favorites`
| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/favorites/{user_id}` | 获取收藏列表 |
| POST | `/api/favorites` | 添加收藏 |
| DELETE | `/api/favorites/{id}` | 取消收藏 |

### 黑名单 `/api/blacklist`
| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/blacklist/{user_id}` | 获取黑名单 |
| POST | `/api/blacklist` | 添加到黑名单 |
| DELETE | `/api/blacklist/{id}` | 从黑名单移除 |

### 用餐反馈 `/api/feedback`
| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/feedback/{user_id}` | 获取反馈记录 |
| POST | `/api/feedback` | 添加反馈 |

## 项目结构

```
backend/
├── .env                 # 环境变量（不提交到 git）
├── .gitignore
├── requirements.txt     # Python 依赖
├── README.md
└── app/
    ├── __init__.py
    ├── main.py          # FastAPI 入口
    ├── config.py        # Supabase 配置
    ├── models.py        # Pydantic 数据模型
    └── routers/         # API 路由
        ├── members.py
        ├── favorites.py
        ├── blacklist.py
        └── feedback.py
```

