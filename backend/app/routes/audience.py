from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.models.content import Content
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/audience",
    tags=["Audience Analytics"]
)


def get_start_date(days: int):
    return datetime.now(timezone.utc) - timedelta(days=days)


def get_filtered_query(
    db: Session,
    current_user,
    platform: str,
    days: int
):
    query = db.query(Content).filter(
        Content.user_id == current_user.id
    )

    if platform != "all":
        query = query.filter(
            func.lower(Content.platform) == platform.lower()
        )

    if days > 0:
        start_date = get_start_date(days)

        query = query.filter(
            Content.published_at >= start_date
        )

    return query


@router.get("/summary")
def audience_summary(
    platform: str = "all",
    days: int = 30,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = get_filtered_query(
        db,
        current_user,
        platform,
        days
    )

    contents = query.all()

    total_views = sum(
        item.views or 0
        for item in contents
    )

    total_reach = sum(
        item.reach or 0
        for item in contents
    )

    total_likes = sum(
        item.likes or 0
        for item in contents
    )

    total_comments = sum(
        item.comments or 0
        for item in contents
    )

    total_shares = sum(
        item.shares or 0
        for item in contents
    )

    total_saves = sum(
        item.saves or 0
        for item in contents
    )

    total_engagement = (
        total_likes
        + total_comments
        + total_shares
        + total_saves
    )

    engagement_rate = 0

    if total_reach > 0:
        engagement_rate = (
            total_engagement / total_reach
        ) * 100

    average_watch_time = 0

    if contents:
        average_watch_time = (
            sum(
                item.watch_time or 0
                for item in contents
            )
            / len(contents)
        )

    return {
        "total_content": len(contents),
        "total_views": total_views,
        "total_reach": total_reach,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_saves": total_saves,
        "total_engagement": total_engagement,
        "engagement_rate": round(
            engagement_rate,
            2
        ),
        "average_watch_time": round(
            average_watch_time,
            2
        ),
        "platform": platform,
        "days": days
    }


@router.get("/platform")
def audience_platform(
    platform: str = "all",
    days: int = 30,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = get_filtered_query(
        db,
        current_user,
        platform,
        days
    )

    contents = query.all()

    platform_data = {}

    for item in contents:

        platform_name = item.platform

        if platform_name not in platform_data:
            platform_data[platform_name] = {
                "platform": platform_name,
                "content": 0,
                "views": 0,
                "reach": 0,
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "saves": 0,
                "engagement": 0
            }

        platform_data[platform_name]["content"] += 1

        platform_data[platform_name]["views"] += (
            item.views or 0
        )

        platform_data[platform_name]["reach"] += (
            item.reach or 0
        )

        platform_data[platform_name]["likes"] += (
            item.likes or 0
        )

        platform_data[platform_name]["comments"] += (
            item.comments or 0
        )

        platform_data[platform_name]["shares"] += (
            item.shares or 0
        )

        platform_data[platform_name]["saves"] += (
            item.saves or 0
        )

        platform_data[platform_name]["engagement"] += (
            (item.likes or 0)
            + (item.comments or 0)
            + (item.shares or 0)
            + (item.saves or 0)
        )

    return {
        "platforms": list(
            platform_data.values()
        ),
        "days": days,
        "platform": platform
    }


@router.get("/activity")
def audience_activity(
    platform: str = "all",
    days: int = 30,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = get_filtered_query(
        db,
        current_user,
        platform,
        days
    )

    contents = query.all()

    activity = {}

    for item in contents:

        if item.published_at:

            hour = item.published_at.hour

            if hour not in activity:
                activity[hour] = 0

            activity[hour] += 1

    result = []

    for hour in sorted(activity.keys()):

        result.append({
            "hour": hour,
            "active_content": activity[hour]
        })

    return {
        "activity": result,
        "days": days,
        "platform": platform
    }
