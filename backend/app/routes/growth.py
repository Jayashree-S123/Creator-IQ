from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone

from app.database import get_db
from app.models.content import Content
from app.models.growth import Growth
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/growth",
    tags=["Growth Analytics"]
)


@router.get("/summary")
def growth_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    contents = db.query(Content).filter(
        Content.user_id == current_user.id
    ).order_by(Content.published_at.asc()).all()

    total_views = sum(item.views or 0 for item in contents)
    total_likes = sum(item.likes or 0 for item in contents)
    total_comments = sum(item.comments or 0 for item in contents)
    total_shares = sum(item.shares or 0 for item in contents)

    total_engagement = (
        total_likes
        + total_comments
        + total_shares
    )

    return {
        "total_content": len(contents),
        "total_views": total_views,
        "total_engagement": total_engagement,
        "growth_timeline": [
            {
                "date": item.published_at.strftime("%Y-%m-%d")
                if item.published_at else "",
                "views": item.views or 0,
                "likes": item.likes or 0,
                "comments": item.comments or 0,
                "shares": item.shares or 0
            }
            for item in contents
        ]
    }


@router.get("/platform")
def growth_platform(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    contents = db.query(Content).filter(
        Content.user_id == current_user.id
    ).all()

    platforms = {}

    for item in contents:
        name = item.platform

        if name not in platforms:
            platforms[name] = {
                "platform": name,
                "content": 0,
                "views": 0,
                "engagement": 0
            }

        platforms[name]["content"] += 1
        platforms[name]["views"] += item.views or 0
        platforms[name]["engagement"] += (
            (item.likes or 0)
            + (item.comments or 0)
            + (item.shares or 0)
            + (item.saves or 0)
        )

    return {
        "platforms": list(platforms.values())
    }


# --------------------------------------------------
# RECORD REAL GROWTH SNAPSHOT
# --------------------------------------------------

@router.post("/record")
def record_growth(
    platform: str,
    followers: int = 0,
    views: int = 0,
    engagement: int = 0,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    growth = Growth(
        user_id=current_user.id,
        platform=platform,
        followers=followers,
        views=views,
        engagement=engagement
    )

    db.add(growth)
    db.commit()
    db.refresh(growth)

    return {
        "message": "Growth data recorded successfully",
        "id": growth.id,
        "platform": growth.platform,
        "followers": growth.followers,
        "views": growth.views,
        "engagement": growth.engagement,
        "recorded_at": growth.recorded_at
    }


# --------------------------------------------------
# GET HISTORICAL GROWTH
# --------------------------------------------------

@router.get("/history")
def growth_history(
    platform: str = "all",
    days: int = 180,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Growth).filter(
        Growth.user_id == current_user.id
    )

    if platform != "all":
        query = query.filter(
            Growth.platform.ilike(platform)
        )

    if days > 0:
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        query = query.filter(
            Growth.recorded_at >= start_date
        )

    records = query.order_by(
        Growth.recorded_at.asc()
    ).all()

    return {
        "platform": platform,
        "days": days,
        "history": [
            {
                "date": item.recorded_at.strftime("%Y-%m-%d")
                if item.recorded_at else "",
                "platform": item.platform,
                "followers": item.followers or 0,
                "views": item.views or 0,
                "engagement": item.engagement or 0
            }
            for item in records
        ]
    }
