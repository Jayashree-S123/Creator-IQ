from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.youtube import YouTubeConnection

from app.services.youtube import (
    YouTubeAPIError,
    creator_search,
    get_channel,
    get_channel_videos,
    get_trending,
)


router = APIRouter(
    prefix="/youtube",
    tags=["YouTube"]
)


def _handle(fn, *args, **kwargs):

    try:
        return fn(*args, **kwargs)

    except YouTubeAPIError as e:

        raise HTTPException(
            status_code=502,
            detail=str(e)
        )


@router.get("/search")
def search_youtube(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user)
):
    """
    Search YouTube creators/channels.
    """

    return {
        "query": q,
        "results": _handle(
            creator_search,
            q
        )
    }


@router.get("/channel/{channel_id}")
def youtube_channel(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get channel information and recent videos.
    """

    result = _handle(
        get_channel,
        channel_id
    )

    if not result:

        raise HTTPException(
            status_code=404,
            detail="YouTube channel not found"
        )

    result["recent_content"] = _handle(
        get_channel_videos,
        channel_id,
        10
    )

    return result


@router.get("/trending")
def youtube_trending(
    region_code: str = "IN",
    max_results: int = Query(
        10,
        ge=1,
        le=50
    ),
    current_user: User = Depends(get_current_user)
):
    """
    Get YouTube trending videos.
    """

    return {
        "items": _handle(
            get_trending,
            region_code,
            max_results
        )
    }


@router.get("/connection")
def youtube_connection(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check whether the current user has connected YouTube.
    """

    connection = (
        db.query(YouTubeConnection)
        .filter(
            YouTubeConnection.user_id
            == current_user.id
        )
        .first()
    )

    if not connection:

        return {
            "connected": False
        }

    return {
        "connected": True,
        "channel": {
            "channel_id": connection.channel_id,
            "channel_title": connection.channel_title,
        }
    }


@router.delete("/connection")
def disconnect_youtube(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disconnect the current user's YouTube account.
    """

    connection = (
        db.query(YouTubeConnection)
        .filter(
            YouTubeConnection.user_id
            == current_user.id
        )
        .first()
    )

    if not connection:

        return {
            "message": "YouTube is not connected"
        }

    db.delete(connection)
    db.commit()

    return {
        "message": "YouTube disconnected successfully"
    }