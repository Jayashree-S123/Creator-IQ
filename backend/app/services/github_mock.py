"""
Mock GitHub data for CreatorIQ development.

This file does NOT connect to GitHub.
It does NOT require GitHub OAuth, Client ID, Client Secret, or API tokens.
"""

from datetime import datetime, timedelta


def get_mock_profile():
    return {
        "id": "mock-github-001",
        "username": "priya-tech",
        "name": "Priya Tech",
        "bio": "Technology Creator | AI | Software Development",
        "location": "Chennai, India",
        "company": "CreatorIQ Labs",
        "profile_url": "https://github.com/priya-tech",
        "avatar": None,
        "followers": 1850,
        "following": 420,
        "public_repositories": 38,
        "public_gists": 12,
        "is_mock": True,
    }


def get_mock_connection():
    return {
        "connected": True,
        "platform": "github",
        "account_name": "Priya Tech",
        "username": "priya-tech",
        "account_id": "mock-github-001",
        "connected_at": "2026-09-30T10:00:00",
        "is_mock": True,
    }


def get_mock_overview():
    return {
        "platform": "github",
        "period": "last_30_days",
        "followers": 1850,
        "followers_change": 12.4,
        "repositories": 38,
        "repositories_change": 8.6,
        "stars": 12640,
        "stars_change": 15.8,
        "forks": 1280,
        "forks_change": 9.7,
        "commits": 284,
        "commits_change": 18.3,
        "pull_requests": 46,
        "issues": 31,
        "is_mock": True,
    }


def get_mock_daily_activity():
    today = datetime.now().date()

    values = [
        (5, 2, 1, 0),
        (8, 3, 1, 1),
        (6, 2, 0, 1),
        (11, 4, 2, 1),
        (14, 5, 2, 2),
        (9, 3, 1, 1),
        (7, 2, 1, 0),
        (12, 4, 2, 1),
        (15, 6, 2, 2),
        (10, 4, 1, 1),
        (18, 7, 3, 2),
        (21, 8, 3, 2),
        (16, 6, 2, 1),
        (13, 5, 2, 1),
        (20, 8, 3, 2),
        (24, 9, 4, 3),
        (19, 7, 3, 2),
        (22, 8, 4, 2),
        (26, 10, 4, 3),
        (23, 9, 3, 2),
        (28, 11, 5, 3),
        (31, 12, 5, 4),
        (27, 10, 4, 3),
        (30, 12, 5, 4),
        (34, 13, 6, 4),
        (29, 11, 5, 3),
        (36, 14, 6, 5),
        (39, 15, 7, 5),
        (35, 13, 6, 4),
        (42, 16, 7, 5),
    ]

    data = []

    for index, (commits, pull_requests, issues, reviews) in enumerate(values):
        date = today - timedelta(days=len(values) - 1 - index)

        data.append({
            "date": date.isoformat(),
            "commits": commits,
            "pull_requests": pull_requests,
            "issues": issues,
            "reviews": reviews,
            "activity": commits + pull_requests + issues + reviews,
        })

    return {
        "platform": "github",
        "period": "last_30_days",
        "data": data,
        "is_mock": True,
    }


def get_mock_repositories():
    return {
        "platform": "github",
        "repositories": [
            {
                "id": "repo-001",
                "name": "creatoriq-analytics",
                "full_name": "priya-tech/creatoriq-analytics",
                "description": "Creator analytics dashboard for social platforms and audience insights.",
                "language": "TypeScript",
                "stars": 4280,
                "forks": 386,
                "open_issues": 18,
                "watchers": 142,
                "commits": 184,
                "updated_at": "2026-09-29T14:30:00",
                "url": "https://github.com/priya-tech/creatoriq-analytics",
                "is_private": False,
            },
            {
                "id": "repo-002",
                "name": "ai-content-assistant",
                "full_name": "priya-tech/ai-content-assistant",
                "description": "AI-powered assistant for generating and managing creator content.",
                "language": "Python",
                "stars": 3150,
                "forks": 294,
                "open_issues": 9,
                "watchers": 118,
                "commits": 152,
                "updated_at": "2026-09-27T11:20:00",
                "url": "https://github.com/priya-tech/ai-content-assistant",
                "is_private": False,
            },
            {
                "id": "repo-003",
                "name": "youtube-automation-toolkit",
                "full_name": "priya-tech/youtube-automation-toolkit",
                "description": "Tools for YouTube creator workflows, analytics and automation.",
                "language": "Python",
                "stars": 2180,
                "forks": 241,
                "open_issues": 7,
                "watchers": 96,
                "commits": 126,
                "updated_at": "2026-09-24T09:45:00",
                "url": "https://github.com/priya-tech/youtube-automation-toolkit",
                "is_private": False,
            },
            {
                "id": "repo-004",
                "name": "social-media-dashboard",
                "full_name": "priya-tech/social-media-dashboard",
                "description": "Multi-platform social media performance dashboard.",
                "language": "React",
                "stars": 1640,
                "forks": 172,
                "open_issues": 12,
                "watchers": 74,
                "commits": 98,
                "updated_at": "2026-09-21T16:10:00",
                "url": "https://github.com/priya-tech/social-media-dashboard",
                "is_private": False,
            },
            {
                "id": "repo-005",
                "name": "creator-api-starter",
                "full_name": "priya-tech/creator-api-starter",
                "description": "Starter project for building creator-focused REST APIs.",
                "language": "FastAPI",
                "stars": 890,
                "forks": 112,
                "open_issues": 5,
                "watchers": 51,
                "commits": 76,
                "updated_at": "2026-09-18T13:25:00",
                "url": "https://github.com/priya-tech/creator-api-starter",
                "is_private": False,
            },
            {
                "id": "repo-006",
                "name": "developer-productivity-lab",
                "full_name": "priya-tech/developer-productivity-lab",
                "description": "Experiments and utilities for improving developer productivity.",
                "language": "JavaScript",
                "stars": 500,
                "forks": 75,
                "open_issues": 4,
                "watchers": 32,
                "commits": 64,
                "updated_at": "2026-09-14T10:05:00",
                "url": "https://github.com/priya-tech/developer-productivity-lab",
                "is_private": False,
            },
        ],
        "is_mock": True,
    }


def get_mock_top_repositories():
    repositories = get_mock_repositories()["repositories"]

    sorted_repositories = sorted(
        repositories,
        key=lambda repo: repo["stars"],
        reverse=True,
    )

    return {
        "platform": "github",
        "repositories": sorted_repositories,
        "is_mock": True,
    }


def get_mock_languages():
    return {
        "platform": "github",
        "languages": [
            {
                "language": "TypeScript",
                "percentage": 34.8,
            },
            {
                "language": "Python",
                "percentage": 28.6,
            },
            {
                "language": "JavaScript",
                "percentage": 17.4,
            },
            {
                "language": "React",
                "percentage": 9.8,
            },
            {
                "language": "FastAPI",
                "percentage": 5.7,
            },
            {
                "language": "Other",
                "percentage": 3.7,
            },
        ],
        "is_mock": True,
    }


def get_mock_growth():
    return {
        "platform": "github",
        "followers": {
            "current": 1850,
            "previous": 1646,
            "growth": 12.4,
        },
        "stars": {
            "current": 12640,
            "previous": 10915,
            "growth": 15.81,
        },
        "forks": {
            "current": 1280,
            "previous": 1167,
            "growth": 9.68,
        },
        "commits": {
            "current": 284,
            "previous": 240,
            "growth": 18.33,
        },
        "is_mock": True,
    }