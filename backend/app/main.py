from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import members, favorites, blacklist, feedback

app = FastAPI(
    title="Eato API",
    description="今天吃啥 - 后端服务",
    version="1.0.0"
)

# CORS 配置 - 允许小程序访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(members.router, prefix="/api")
app.include_router(favorites.router, prefix="/api")
app.include_router(blacklist.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Eato API 运行中", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

