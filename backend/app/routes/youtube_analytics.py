from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.models.user import User

from app.services.youtube_analytics import (
    get_mock_youtube_channels,
    get_mock_youtube_overview,
    get_mock_youtube_videos,
    get_mock_youtube_traffic,
    get_mock_youtube_daily,
)


router = APIRouter(
    prefix="/youtube/analytics",
    tags=["YouTube Analytics"]
)


@router.get("/channels")
def youtube_channels(
    current_user: User = Depends(get_current_user)
):
    return get_mock_youtube_channels()


@router.get("/overview/{channel_id}")
def youtube_overview(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    return get_mock_youtube_overview(channel_id)


@router.get("/videos/{channel_id}")
def youtube_videos(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    return get_mock_youtube_videos(channel_id)


@router.get("/traffic/{channel_id}")
def youtube_traffic(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    return get_mock_youtube_traffic(channel_id)


@router.get("/daily/{channel_id}")
def youtube_daily(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    return get_mock_youtube_daily(channel_id)