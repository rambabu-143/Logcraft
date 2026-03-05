from fastapi import Request, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from .database import get_session
from .models import User, Session as UserSession

async def get_current_user(request: Request, db: Session = Depends(get_session)) -> User:
    # Try multiple common NextAuth cookie names
    session_token = request.cookies.get("next-auth.session-token") or \
                    request.cookies.get("__Secure-next-auth.session-token")
    
    if not session_token:
        # Also check Authorization header as fallback if frontend passes it manually
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]

    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Find the session in the database
    statement = select(UserSession).where(UserSession.sessionToken == session_token)
    session_record = db.exec(statement).first()

    if not session_record or session_record.expires < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    # Get the user associated with the session
    user = db.get(User, session_record.userId)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user
