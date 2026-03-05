from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import Optional, List
from datetime import datetime

class ProjectCreate(BaseModel):
    repoFullName: str = Field(..., pattern=r"^[\w.-]+\/[\w.-]+$")
    githubRepoId: str
    publicSlug: str = Field(..., min_length=2, max_length=50, pattern=r"^[a-z0-9-]+$")
    slackWebhookUrl: Optional[str] = None
    notifyEmail: Optional[str] = None

class ProjectUpdate(BaseModel):
    slackWebhookUrl: Optional[str] = None
    notifyEmail: Optional[str] = None
    isActive: Optional[bool] = None

class ProjectResponse(BaseModel):
    id: str
    repoFullName: str
    githubRepoId: str
    publicSlug: str
    isActive: bool
    createdAt: datetime
    
    class Config:
        from_attributes = True

class ChangelogResponse(BaseModel):
    id: str
    version: str
    generatedContent: str
    isPublished: bool
    createdAt: datetime

    class Config:
        from_attributes = True
