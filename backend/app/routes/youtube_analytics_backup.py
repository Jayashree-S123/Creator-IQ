from fastapi import APIRouter, Depends, HTTPException, Query

from app.dependencies import get_current_user
from app.models.user import User

from app.services.youtube_analytics import (
    overview,
    daily,
    top_videos,
    traffic_sources,
    audience,
)


router = APIRouter(
    prefix="/youtube/analytics",
    tags=["YouTube Analytics"]
)


def handle(fn, *args, **kwargs):

    try:
        return fn(*args, **kwargs)

    except RuntimeError as e:

        raise HTTPException(
            status_code=502,
            detail=str(e)
        )


@router.get("/overview")
def analytics_overview(
    start_date: str | None = None,
    end_date: str | None = None,
    current_user: User = Depends(get_current_user)
):
    return handle(
        overview,
        current_user.id,
        start_date,
        end_date
    )


@router.get("/daily")
def analytics_daily(
    start_date: str | None = None,
    end_date: str | None = None,
    current_user: User = Depends(get_current_user)
):
    return handle(
        daily,
        current_user.id,
        start_date,
        end_date
    )


@router.get("/top-videos")
def analytics_top_videos(
    start_date: str | None = None,
    end_date: str | None = None,
    current_user: User = Depends(get_current_user)
):
    return handle(
        top_videos,
        current_user.id,
        start_date,
        end_date
    )


@router.get("/traffic-sources")
def analytics_traffic_sources(
    start_date: str | None = None,
    end_date: str | None = None,
    current_user: User = Depends(get_current_user)
):
    return handle(
        traffic_sources,
        current_user.id,
        start_date,
        end_date
    )


@router.get("/audience")
def analytics_audience(
    start_date: str | None = None,
    end_date: str | None = None,
    current_user: User = Depends(get_current_user)
):
    return handle(
        audience,
        current_user.id,
        start_date,
        end_date
    )