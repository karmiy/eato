from fastapi import APIRouter, HTTPException
from typing import List
from app.config import get_supabase
from app.models import MemberCreate, MemberUpdate, Member

router = APIRouter(prefix="/members", tags=["成员管理"])

@router.get("/{user_id}", response_model=List[Member])
async def get_members(user_id: str):
    """获取用户的所有成员"""
    supabase = get_supabase()
    result = supabase.table("members").select("*").eq("user_id", user_id).execute()
    return result.data

@router.post("/", response_model=Member)
async def create_member(member: MemberCreate):
    """创建新成员"""
    supabase = get_supabase()
    data = member.dict()
    result = supabase.table("members").insert(data).execute()
    if not result.data:
        raise HTTPException(status_code=400, detail="创建失败")
    return result.data[0]

@router.put("/{member_id}", response_model=Member)
async def update_member(member_id: str, member: MemberUpdate):
    """更新成员信息"""
    supabase = get_supabase()
    data = {k: v for k, v in member.dict().items() if v is not None}
    result = supabase.table("members").update(data).eq("id", member_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="成员不存在")
    return result.data[0]

@router.delete("/{member_id}")
async def delete_member(member_id: str):
    """删除成员"""
    supabase = get_supabase()
    result = supabase.table("members").delete().eq("id", member_id).execute()
    return {"message": "删除成功"}

