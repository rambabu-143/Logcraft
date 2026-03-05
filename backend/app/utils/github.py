import httpx
from typing import List, Optional

class GitHubClient:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Changelogfy-FastAPI"
        }

    async def create_webhook(self, repo_full_name: str, webhook_url: str, secret: str) -> int:
        url = f"{self.base_url}/repos/{repo_full_name}/hooks"
        data = {
            "name": "web",
            "active": True,
            "events": ["push", "create"],
            "config": {
                "url": webhook_url,
                "content_type": "json",
                "secret": secret
            }
        }
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=data, headers=self.headers)
            response.raise_for_status()
            return response.json()["id"]

    async def list_user_repos(self) -> List[dict]:
        repos = []
        page = 1
        async with httpx.AsyncClient() as client:
            while True:
                url = f"{self.base_url}/user/repos"
                params = {
                    "per_page": 100,
                    "page": page,
                    "sort": "updated",
                    "affiliation": "owner,collaborator,organization_member"
                }
                response = await client.get(url, params=params, headers=self.headers)
                response.raise_for_status()
                data = response.json()
                if not data:
                    break
                repos.extend([{
                    "id": r["id"],
                    "fullName": r["full_name"],
                    "private": r["private"],
                    "description": r.get("description")
                } for r in data])
                if len(data) < 100:
                    break
                page += 1
        return repos
