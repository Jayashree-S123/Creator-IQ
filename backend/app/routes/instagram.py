from fastapi import APIRouter, HTTPException, Query

from app.services.instagram import (
    get_related_profiles,
    get_user_info,
    get_user_feeds,
)


router = APIRouter(
    prefix="/instagram",
    tags=["Instagram"]
)


@router.get("/related-profiles")
def related_profiles(
    id: int = Query(..., description="Instagram user ID"),
    fields: str | None = Query(None)
):
    try:
        return get_related_profiles(id, fields)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/user-info")
def user_info(
    id: int = Query(..., description="Instagram user ID"),
    fields: str | None = Query(None)
):
    try:
        return get_user_info(id, fields)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/media")
def media(
    id: int = Query(..., description="Instagram user ID"),
    count: int = Query(12, ge=1, le=50),
):
    try:
        return get_user_feeds(
            user_id=id,
            count=count,
            allow_restricted_media=False,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )