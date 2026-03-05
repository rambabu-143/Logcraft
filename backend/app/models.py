from datetime import datetime
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel, JSON, Column
from enum import Enum

class Plan(str, Enum):
    FREE = "FREE"
    STARTER = "STARTER"
    PRO = "PRO"

class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: Optional[str] = None
    email: Optional[str] = Field(default=None, unique=True)
    emailVerified: Optional[datetime] = None
    image: Optional[str] = None
    githubAccessToken: Optional[str] = None
    stripeCustomerId: Optional[str] = Field(default=None, unique=True)
    stripeSubscriptionId: Optional[str] = None
    plan: Plan = Field(default=Plan.FREE)
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    projects: List["Project"] = Relationship(back_populates="user")
    accounts: List["Account"] = Relationship(back_populates="user")
    sessions: List["Session"] = Relationship(back_populates="user")

class Account(SQLModel, table=True):
    id: str = Field(primary_key=True)
    userId: str = Field(foreign_key="user.id")
    type: str
    provider: str
    providerAccountId: str
    refresh_token: Optional[str] = None
    access_token: Optional[str] = None
    expires_at: Optional[int] = None
    token_type: Optional[str] = None
    scope: Optional[str] = None
    id_token: Optional[str] = None
    session_state: Optional[str] = None

    user: User = Relationship(back_populates="accounts")

class Session(SQLModel, table=True):
    id: str = Field(primary_key=True)
    sessionToken: str = Field(unique=True)
    userId: str = Field(foreign_key="user.id")
    expires: datetime

    user: User = Relationship(back_populates="sessions")

class Project(SQLModel, table=True):
    id: str = Field(primary_key=True)
    userId: str = Field(foreign_key="user.id")
    repoFullName: str
    githubRepoId: str
    publicSlug: str = Field(unique=True)
    slackWebhookUrl: Optional[str] = None
    notifyEmail: Optional[str] = None
    lastCommitSha: Optional[str] = None
    isActive: bool = Field(default=True)
    webhookId: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="projects")
    changelogs: List["Changelog"] = Relationship(back_populates="project")
    subscribers: List["Subscriber"] = Relationship(back_populates="project")

class Changelog(SQLModel, table=True):
    id: str = Field(primary_key=True)
    projectId: str = Field(foreign_key="project.id")
    version: str
    rawCommits: dict = Field(default_factory=dict, sa_column=Column(JSON))
    generatedContent: str
    isPublished: bool = Field(default=True)
    publishedAt: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    project: Project = Relationship(back_populates="changelogs")

class Subscriber(SQLModel, table=True):
    id: str = Field(primary_key=True)
    projectId: str = Field(foreign_key="project.id")
    email: str
    confirmedAt: Optional[datetime] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    project: Project = Relationship(back_populates="subscribers")
