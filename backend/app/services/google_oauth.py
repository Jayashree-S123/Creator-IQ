import os
from datetime import datetime, timezone, timedelta

import requests
from dotenv import load_dotenv

from app.database import SessionLocal
from app.models.youtube import YouTubeConnection
from app.security import create_access_token, SECRET_KEY, ALGORITHM

from jose import jwt, JWTError


load_dotenv()


GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI",
    "http://localhost:8000/auth/youtube/callback"
)

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"

YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3"


SCOPES = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/yt-analytics.readonly",
]


def create_oauth_state(user_id: int):
    """
    Create a short-lived signed OAuth state token.
    """

    return create_access_token(
        {
            "sub": str(user_id),
            "purpose": "youtube_oauth"
        },
        expires_delta=timedelta(minutes=10)
    )


def get_user_id_from_state(state: str):
    """
    Validate OAuth state and extract user ID.
    """

    try:
        payload = jwt.decode(
            state,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("purpose") != "youtube_oauth":
            return None

        user_id = payload.get("sub")

        if not user_id:
            return None

        return int(user_id)

    except (JWTError, ValueError, TypeError):
        return None


def authorization_url(user_id: int):
    """
    Generate Google authorization URL.
    """

    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise RuntimeError(
            "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not configured"
        )

    state = create_oauth_state(user_id)

    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "access_type": "offline",
        "prompt": "consent",
        "state": state,
    }

    from urllib.parse import urlencode

    return f"{GOOGLE_AUTH_URL}?{urlencode(params)}"


def exchange_code(code: str):
    """
    Exchange Google authorization code for tokens.
    """

    response = requests.post(
        GOOGLE_TOKEN_URL,
        data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        },
        timeout=20
    )

    if not response.ok:
        try:
            detail = response.json()
        except Exception:
            detail = response.text

        raise RuntimeError(
            f"Google token exchange failed: {detail}"
        )

    return response.json()


def get_youtube_channel(access_token: str):
    response = requests.get(
        f"{YOUTUBE_BASE_URL}/channels",
        params={
            "part": "id,snippet,statistics,contentDetails",
            "mine": "true",
        },
        headers={
            "Authorization": f"Bearer {access_token}"
        },
        timeout=20
    )

    print("YOUTUBE CHANNEL API STATUS:", response.status_code)

    if not response.ok:
        try:
            error_data = response.json()
            detail = error_data.get("error", {}).get(
                "message",
                response.text
            )
        except Exception:
            detail = response.text

        print("YOUTUBE CHANNEL API ERROR:", detail)

        raise RuntimeError(
            f"Unable to retrieve YouTube channel: {detail}"
        )

    try:
        data = response.json()
    except Exception as e:
        print("YOUTUBE CHANNEL JSON ERROR:", repr(e))
        print("YOUTUBE CHANNEL RESPONSE:", response.text[:500])
        raise RuntimeError(
            "YouTube returned an invalid JSON response"
        )

    print("YOUTUBE CHANNEL RESPONSE KEYS:", list(data.keys()))

    items = data.get("items", [])

    print("YOUTUBE CHANNEL COUNT:", len(items))

    if not items:
        raise RuntimeError(
            "No YouTube channel was found for this Google account"
        )

    return items[0]

    data = response.json()
    items = data.get("items", [])

    print("YOUTUBE CHANNEL API STATUS:", response.status_code)
    print("YOUTUBE CHANNEL COUNT:", len(items))

    if not items:
        raise RuntimeError(
            "No YouTube channel was found for this Google account"
        )

    return items[0]
    data = response.json()

    items = data.get("items", [])

    if not items:
        raise RuntimeError(
            "No YouTube channel was found for this Google account"
        )

    return items[0]


def save_tokens(user_id: int, token_data: dict):
    """
    Save or update YouTube OAuth connection.
    """

    access_token = token_data.get("access_token")

    if not access_token:
        raise RuntimeError("Google did not return an access token")

    channel = get_youtube_channel(access_token)

    channel_id = channel.get("id")

    snippet = channel.get("snippet", {})
    channel_title = snippet.get("title")

    expires_in = int(
        token_data.get("expires_in", 3600)
    )

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(seconds=expires_in)
    )

    db = SessionLocal()

    try:
        connection = (
            db.query(YouTubeConnection)
            .filter(
                YouTubeConnection.user_id == user_id
            )
            .first()
        )

        if connection:

            connection.channel_id = channel_id
            connection.channel_title = channel_title
            connection.access_token = access_token

            if token_data.get("refresh_token"):
                connection.refresh_token = token_data[
                    "refresh_token"
                ]

            connection.token_type = token_data.get(
                "token_type",
                "Bearer"
            )

            connection.expires_at = expires_at

        else:

            connection = YouTubeConnection(
                user_id=user_id,
                channel_id=channel_id,
                channel_title=channel_title,
                access_token=access_token,
                refresh_token=token_data.get(
                    "refresh_token"
                ),
                token_type=token_data.get(
                    "token_type",
                    "Bearer"
                ),
                expires_at=expires_at,
            )

            db.add(connection)

        db.commit()
        db.refresh(connection)

        return connection

    finally:
        db.close()


def get_valid_access_token(user_id: int):
    """
    Return a valid YouTube access token.
    Refresh it automatically when necessary.
    """

    db = SessionLocal()

    try:

        connection = (
            db.query(YouTubeConnection)
            .filter(
                YouTubeConnection.user_id == user_id
            )
            .first()
        )

        if not connection:
            return None

        now = datetime.now(timezone.utc)

        if (
            connection.expires_at
            and connection.expires_at
            > now + timedelta(seconds=30)
        ):
            return connection.access_token

        if not connection.refresh_token:
            return connection.access_token

        response = requests.post(
            GOOGLE_TOKEN_URL,
            data={
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "refresh_token": connection.refresh_token,
                "grant_type": "refresh_token",
            },
            timeout=20
        )

        if not response.ok:
            return None

        data = response.json()

        new_access_token = data.get("access_token")

        if not new_access_token:
            return None

        expires_in = int(
            data.get("expires_in", 3600)
        )

        connection.access_token = new_access_token

        connection.expires_at = (
            datetime.now(timezone.utc)
            + timedelta(seconds=expires_in)
        )

        connection.updated_at = datetime.now(timezone.utc)

        db.commit()

        return new_access_token

    finally:
        db.close()