import os
import secrets
from urllib.parse import urlencode

import requests
from dotenv import load_dotenv



load_dotenv()

LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")
LINKEDIN_REDIRECT_URI = os.getenv(
    "LINKEDIN_REDIRECT_URI",
    "http://localhost:8000/linkedin/callback",
)

LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"


def generate_linkedin_state() -> str:
    return secrets.token_urlsafe(32)


def get_linkedin_authorization_url(state: str) -> str:
    if not LINKEDIN_CLIENT_ID:
        raise ValueError("LINKEDIN_CLIENT_ID is not configured")

    params = {
        "response_type": "code",
        "client_id": LINKEDIN_CLIENT_ID,
        "redirect_uri": LINKEDIN_REDIRECT_URI,
        "state": state,
        "scope": "openid profile email",
    }

    return f"{LINKEDIN_AUTH_URL}?{urlencode(params)}"


def exchange_linkedin_code(code: str) -> dict:
    if not LINKEDIN_CLIENT_ID:
        raise ValueError("LINKEDIN_CLIENT_ID is not configured")

    if not LINKEDIN_CLIENT_SECRET:
        raise ValueError("LINKEDIN_CLIENT_SECRET is not configured")

    response = requests.post(
        LINKEDIN_TOKEN_URL,
        data={
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": LINKEDIN_REDIRECT_URI,
            "client_id": LINKEDIN_CLIENT_ID,
            "client_secret": LINKEDIN_CLIENT_SECRET,
        },
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout=15,
    )

    if not response.ok:
        raise ValueError(
            f"LinkedIn token exchange failed: "
            f"{response.status_code} {response.text}"
        )

    return response.json()