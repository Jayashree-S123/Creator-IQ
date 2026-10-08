import os

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse

from app.dependencies import get_current_user
from app.models.user import User

from app.services.google_oauth import (
    authorization_url,
    exchange_code,
    get_user_id_from_state,
    save_tokens,
)

router = APIRouter(
    prefix="/auth/youtube",
    tags=["YouTube OAuth"]
)


@router.get("/connect")
def connect_youtube(
    current_user: User = Depends(get_current_user)
):
    try:
        url = authorization_url(current_user.id)

        # Return the URL so Swagger/frontend can open it.
        return {
            "authorization_url": url
        }

    except RuntimeError as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/callback")
def youtube_callback(
    code: str = Query(...),
    state: str = Query(...)
):
    # Validate the state FIRST.
    user_id = get_user_id_from_state(state)

    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OAuth state"
        )

    try:
        # Exchange Google's authorization code.
        token_data = exchange_code(code)

        # Save YouTube connection.
        connection = save_tokens(
            user_id,
            token_data
        )

        print(
            "YOUTUBE CONNECTED:",
            connection.channel_id,
            connection.channel_title
        )

        frontend_url = os.getenv(
            "FRONTEND_URL",
            "http://localhost:5173"
        )

        return RedirectResponse(
            url=f"{frontend_url}/dashboard?youtube=connected",
            status_code=302
        )

    except Exception as e:
        print(
            "YOUTUBE OAUTH ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )