from fastapi import APIRouter, Depends, HTTPException

from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.linkedin import LinkedInConnection

from app.services.linkedin import (
    get_linkedin_authorization_url,
    exchange_linkedin_code,
    generate_linkedin_state,
)
from app.services.linkedin_mock import (
    get_mock_profile,
    get_mock_connection,
    get_mock_overview,
    get_mock_daily_analytics,
    get_mock_posts,
    get_mock_top_posts,
    get_mock_audience,
    get_mock_growth,
)

router = APIRouter(
    prefix="/linkedin",
    tags=["LinkedIn"],
)

@router.get("/connect/")
def linkedin_connect(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        state = generate_linkedin_state()

        connection = (
            db.query(LinkedInConnection)
            .filter(LinkedInConnection.user_id == current_user.id)
            .first()
        )

        if connection:
            connection.oauth_state = state
        else:
            connection = LinkedInConnection(
                user_id=current_user.id,
                access_token="pending",
                oauth_state=state,
            )
            db.add(connection)

        db.commit()

        authorization_url = get_linkedin_authorization_url(state)

        return {
    "authorization_url": authorization_url
}

    except ValueError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.get("/callback")
def linkedin_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    if error:
        return {
            "success": False,
            "error": error,
        }

    if not code:
        raise HTTPException(
            status_code=400,
            detail="Authorization code is missing",
        )

    if not state:
        raise HTTPException(
            status_code=400,
            detail="OAuth state is missing",
        )

    connection = (
        db.query(LinkedInConnection)
        .filter(LinkedInConnection.oauth_state == state)
        .first()
    )

    if not connection:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OAuth state",
        )

    try:
        token_data = exchange_linkedin_code(code)

        access_token = token_data.get("access_token")

        if not access_token:
            raise HTTPException(
                status_code=400,
                detail="LinkedIn did not return an access token",
            )

        connection.access_token = access_token
        connection.oauth_state = None

        db.commit()

        return {
            "success": True,
            "message": "LinkedIn account connected successfully",
            "token_saved": True,
            "expires_in": token_data.get("expires_in"),
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get("/connection")
def linkedin_connection(
    current_user: User = Depends(get_current_user),
):
    return get_mock_connection()


@router.get("/profile")
def linkedin_profile(
    current_user: User = Depends(get_current_user),
):
    return get_mock_profile()


@router.get("/analytics/overview")
def linkedin_analytics_overview(
    current_user: User = Depends(get_current_user),
):
    return get_mock_overview()


@router.get("/analytics/daily")
def linkedin_analytics_daily(
    current_user: User = Depends(get_current_user),
):
    return get_mock_daily_analytics()


@router.get("/analytics/top-posts")
def linkedin_top_posts(
    current_user: User = Depends(get_current_user),
):
    return get_mock_top_posts()


@router.get("/analytics/audience")
def linkedin_audience(
    current_user: User = Depends(get_current_user),
):
    return get_mock_audience()


@router.get("/analytics/growth")
def linkedin_growth(
    current_user: User = Depends(get_current_user),
):
    return get_mock_growth()


@router.get("/posts")
def linkedin_posts(
    current_user: User = Depends(get_current_user),
):
    return get_mock_posts()