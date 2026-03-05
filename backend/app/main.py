from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
from .database import get_session
from .models import Project, Changelog, User, Plan
from .auth import get_current_user
from .schemas import ProjectCreate, ProjectResponse, ChangelogResponse
from .utils.github import GitHubClient
import os
import uuid
from datetime import datetime

app = FastAPI(title="Changelogfy API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Changelogfy API"}

@app.get("/api/github/repos")
async def get_github_repos(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    if not current_user.githubAccessToken:
        raise HTTPException(status_code=403, detail="GitHub token missing")
    
    gh = GitHubClient(current_user.githubAccessToken)
    repos = await gh.list_user_repos()
    
    # Check which repos are already connected
    statement = select(Project.githubRepoId).where(Project.userId == current_user.id)
    connected_ids = set(session.exec(statement).all())
    
    for repo in repos:
        repo["alreadyConnected"] = str(repo["id"]) in connected_ids
        
    return repos

@app.get("/api/projects", response_model=List[ProjectResponse])
async def get_projects(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(Project).where(Project.userId == current_user.id).order_by(Project.createdAt.desc())
    projects = session.exec(statement).all()
    return projects

@app.post("/api/projects", response_model=ProjectResponse, status_code=201)
async def create_project(
    project_data: ProjectCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Enforce repo limit
    PLAN_LIMITS = {
        Plan.FREE: 1,
        Plan.STARTER: 5,
        Plan.PRO: 100
    }
    limit = PLAN_LIMITS.get(current_user.plan, 1)
    
    # Check current count
    statement = select(Project).where(Project.userId == current_user.id, Project.isActive == True)
    count = len(session.exec(statement).all())
    
    if count >= limit:
        raise HTTPException(status_code=403, detail=f"Your {current_user.plan} plan allows {limit} projects.")

    # Check slug availability
    existing = session.exec(select(Project).where(Project.publicSlug == project_data.publicSlug)).first()
    if existing:
        raise HTTPException(status_code=409, detail="This slug is already taken.")

    # GitHub Webhook
    webhook_id = None
    if current_user.githubAccessToken:
        gh = GitHubClient(current_user.githubAccessToken)
        webhook_url = f"{os.getenv('FRONTEND_URL')}/api/webhooks/github"
        try:
            webhook_id = await gh.create_webhook(
                project_data.repoFullName, 
                webhook_url, 
                os.getenv("GITHUB_WEBHOOK_SECRET", "")
            )
        except Exception as e:
            print(f"Failed to create GitHub webhook: {e}")

    new_project = Project(
        id=str(uuid.uuid4()),
        userId=current_user.id,
        repoFullName=project_data.repoFullName,
        githubRepoId=project_data.githubRepoId,
        publicSlug=project_data.publicSlug,
        slackWebhookUrl=project_data.slackWebhookUrl,
        notifyEmail=project_data.notifyEmail,
        webhookId=str(webhook_id) if webhook_id else None,
        isActive=True
    )
    
    session.add(new_project)
    session.commit()
    session.refresh(new_project)
    return new_project

@app.get("/api/projects/{project_id}/changelogs", response_model=List[ChangelogResponse])
async def get_project_changelogs(
    project_id: str, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # Check if project belongs to user
    project = session.get(Project, project_id)
    if not project or project.userId != current_user.id:
        raise HTTPException(status_code=404, detail="Project not found")

    statement = select(Changelog).where(Changelog.projectId == project_id).order_by(Changelog.createdAt.desc())
    changelogs = session.exec(statement).all()
    return [ChangelogResponse.from_orm(c) for c in changelogs]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
