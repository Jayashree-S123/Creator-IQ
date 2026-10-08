import os
import requests
from dotenv import load_dotenv

load_dotenv()

RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST = os.getenv(
    "RAPIDAPI_HOST",
    "instagram-looter2.p.rapidapi.com"
)

BASE_URL = f"https://{RAPIDAPI_HOST}"


def get_related_profiles(user_id: int, fields: str | None = None):
    if not RAPIDAPI_KEY:
        raise RuntimeError("RAPIDAPI_KEY is not configured")

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
    }

    params = {
        "id": user_id
    }

    if fields:
        params["fields"] = fields

    response = requests.get(
        f"{BASE_URL}/related-profiles",
        headers=headers,
        params=params,
        timeout=30,
    )

    response.raise_for_status()

    return response.json()

def get_user_info(user_id: int, fields: str | None = None):
    if not RAPIDAPI_KEY:
        raise RuntimeError("RAPIDAPI_KEY is not configured")

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
    }

    params = {
        "id": user_id
    }

    if fields:
        params["fields"] = fields

    response = requests.get(
        f"{BASE_URL}/profile",
        headers=headers,
        params=params,
        timeout=30,
    )

    response.raise_for_status()

    return response.json()

def get_user_feeds(
    user_id: int,
    count: int = 12,
    allow_restricted_media: bool = False,
):
    if not RAPIDAPI_KEY:
        raise RuntimeError("RAPIDAPI_KEY is not configured")

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": RAPIDAPI_HOST,
    }

    params = {
        "allow_restricted_media": str(allow_restricted_media).lower(),
        "id": user_id,
        "count": count,
    }

    response = requests.get(
        f"{BASE_URL}/user-feeds",
        headers=headers,
        params=params,
        timeout=30,
    )

    response.raise_for_status()

    return response.json()