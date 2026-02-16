import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

class SupabaseClient:
    """纯 Python 的 Supabase REST API 客户端"""

    def __init__(self):
        self.base_url = f"{SUPABASE_URL}/rest/v1"
        self.headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }

    def table(self, name: str):
        return TableQuery(self.base_url, self.headers, name)

class TableQuery:
    """表查询构建器"""

    def __init__(self, base_url: str, headers: dict, table: str):
        self.url = f"{base_url}/{table}"
        self.headers = headers.copy()
        self.params = {}
        self._method = "GET"
        self._data = None

    def select(self, columns: str = "*"):
        self.params["select"] = columns
        return self

    def eq(self, column: str, value):
        self.params[column] = f"eq.{value}"
        return self

    def order(self, column: str, desc: bool = False):
        direction = "desc" if desc else "asc"
        self.params["order"] = f"{column}.{direction}"
        return self

    def insert(self, data: dict):
        self._method = "POST"
        self._data = data
        return self

    def update(self, data: dict):
        self._method = "PATCH"
        self._data = data
        return self

    def delete(self):
        self._method = "DELETE"
        return self

    def execute(self):
        with httpx.Client() as client:
            if self._method == "GET":
                response = client.get(self.url, headers=self.headers, params=self.params)
            elif self._method == "POST":
                response = client.post(self.url, headers=self.headers, json=self._data)
            elif self._method == "PATCH":
                response = client.patch(self.url, headers=self.headers, json=self._data, params=self.params)
            elif self._method == "DELETE":
                response = client.delete(self.url, headers=self.headers, params=self.params)

            response.raise_for_status()
            return QueryResult(response.json() if response.text else [])

class QueryResult:
    """查询结果"""
    def __init__(self, data):
        self.data = data

def get_supabase() -> SupabaseClient:
    return SupabaseClient()

