from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.content import Content
from dependencies import get_current_user


router = APIRouter(
    prefix="/content",
    tags=["Content Analytics"]
)


@router.post("/")
def create_content(
    title: str,
    platform: str,
    views: int = 0,
    likes: int = 0,
    comments: int = 0,
    shares: int = 0,
    saves: int = 0,
    watch_time: float = 0,
    reach: int = 0,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    total_engagement = (
        likes +
        comments +
        shares +
        saves
    )

    engagement_rate = 0

    if reach > 0:
        engagement_rate = (
            total_engagement / reach
        ) * 100

    new_content = Content(
        user_id=current_user.id,
        title=title,
        platform=platform,
        views=views,
        likes=likes,
        comments=comments,
        shares=shares,
        saves=saves,
        watch_time=watch_time,
        reach=reach,
        engagement_rate=engagement_rate
    )

    db.add(new_content)
    db.commit()
    db.refresh(new_content)

    return {
        "message": "Content added successfully",
        "content": {
            "id": new_content.id,
            "title": new_content.title,
            "platform": new_content.platform,
            "views": new_content.views,
            "likes": new_content.likes,
            "comments": new_content.comments,
            "shares": new_content.shares,
            "saves": new_content.saves,
            "watch_time": new_content.watch_time,
            "reach": new_content.reach,
            "engagement_rate": new_content.engagement_rate
        }
    }


@router.get("/")
def get_content(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    contents = db.query(Content).filter(
        Content.user_id == current_user.id
    ).all()

    return {
        "total": len(contents),
        "content": [
            {
                "id": item.id,
                "title": item.title,
                "platform": item.platform,
                "views": item.views,
                "likes": item.likes,
                "comments": item.comments,
                "shares": item.shares,
                "saves": item.saves,
                "watch_time": item.watch_time,
                "reach": item.reach,
                "engagement_rate": item.engagement_rate
            }
            for item in contents
        ]
    }


@router.get("/summary")
def content_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    contents = db.query(Content).filter(
        Content.user_id == current_user.id
    ).all()

    total_views = sum(item.views for item in contents)
    total_likes = sum(item.likes for item in contents)
    total_comments = sum(item.comments for item in contents)
    total_shares = sum(item.shares for item in contents)
    total_saves = sum(item.saves for item in contents)
    total_reach = sum(item.reach for item in contents)

    total_engagement = (
        total_likes +
        total_comments +
        total_shares +
        total_saves
    )

    engagement_rate = 0

    if total_reach > 0:
        engagement_rate = (
            total_engagement / total_reach
        ) * 100

    return {
        "total_content": len(contents),
        "total_views": total_views,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_saves": total_saves,
        "total_reach": total_reach,
        "engagement_rate": round(
            engagement_rate,
            2
        )
    }


@router.get("/top")
def top_content(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    contents = db.query(Content).filter(
        Content.user_id == current_user.id
    ).order_by(
        Content.views.desc()
    ).limit(5).all()

    return {
        "top_content": [
            {
                "id": item.id,
                "title": item.title,
                "platform": item.platform,
                "views": item.views,
                "likes": item.likes,
                "comments": item.comments,
                "shares": item.shares,
                "engagement_rate": item.engagement_rate
            }
            for item in contents
        ]
    }

@router.put("/{content_id}")
def update_content(
    content_id: int,
    title: str,
    platform: str,
    views: int = 0,
    likes: int = 0,
    comments: int = 0,
    shares: int = 0,
    saves: int = 0,
    watch_time: float = 0,
    reach: int = 0,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id
    ).first()

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    total_engagement = (
        likes +
        comments +
        shares +
        saves
    )

    engagement_rate = 0

    if reach > 0:
        engagement_rate = (
            total_engagement / reach
        ) * 100

    content.title = title
    content.platform = platform
    content.views = views
    content.likes = likes
    content.comments = comments
    content.shares = shares
    content.saves = saves
    content.watch_time = watch_time
    content.reach = reach
    content.engagement_rate = engagement_rate

    db.commit()
    db.refresh(content)

    return {
        "message": "Content updated successfully",
        "content": {
            "id": content.id,
            "title": content.title,
            "platform": content.platform,
            "views": content.views,
            "likes": content.likes,
            "comments": content.comments,
            "shares": content.shares,
            "saves": content.saves,
            "watch_time": content.watch_time,
            "reach": content.reach,
            "engagement_rate": content.engagement_rate
        }
    }


@router.delete("/{content_id}")
def delete_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    content = db.query(Content).filter(
        Content.id == content_id,
        Content.user_id == current_user.id
    ).first()

    if not content:
        raise HTTPException(
            status_code=404,
            detail="Content not found"
        )

    db.delete(content)
    db.commit()

    return {
        "message": "Content deleted successfully",
        "content_id": content_id
    }