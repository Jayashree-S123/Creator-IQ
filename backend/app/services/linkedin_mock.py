"""
Mock LinkedIn data for CreatorIQ development.

This file does NOT connect to LinkedIn.
It does NOT require Client ID, Client Secret, OAuth, or tokens.
"""

from datetime import datetime, timedelta


def get_mock_profile():
    return {
        "id": "mock-linkedin-001",
        "name": "Priya Tech",
        "first_name": "Priya",
        "last_name": "Tech",
        "headline": "Technology Creator | AI | Software Development",
        "location": "Chennai, India",
        "profile_url": "https://www.linkedin.com/in/mock-priya-tech",
        "profile_image": None,
        "followers": 25400,
        "connections": 3120,
        "is_mock": True,
    }


def get_mock_connection():
    return {
        "connected": True,
        "platform": "linkedin",
        "account_name": "Priya Tech",
        "account_id": "mock-linkedin-001",
        "connected_at": "2026-09-30T10:00:00",
        "is_mock": True,
    }


def get_mock_overview():
    return {
        "platform": "linkedin",
        "period": "last_30_days",

        "followers": 25400,
        "followers_change": 8.7,

        "impressions": 184500,
        "impressions_change": 14.3,

        "engagements": 12680,
        "engagement_change": 11.8,

        "engagement_rate": 6.87,

        "likes": 8420,
        "comments": 2140,
        "shares": 980,
        "clicks": 1140,

        "posts": 18,
        "profile_views": 3860,

        "is_mock": True,
    }


def get_mock_daily_analytics():
    today = datetime.now().date()

    data = []

    values = [
        (720, 38, 12, 5),
        (850, 44, 15, 7),
        (910, 51, 17, 8),
        (780, 41, 13, 6),
        (1120, 63, 21, 11),
        (1280, 71, 24, 13),
        (1190, 67, 22, 12),
        (980, 55, 18, 9),
        (1050, 58, 20, 10),
        (1370, 76, 27, 15),
        (1420, 81, 29, 16),
        (1310, 73, 25, 13),
        (1490, 84, 31, 17),
        (1580, 91, 34, 19),
        (1510, 87, 32, 18),
        (1640, 95, 36, 20),
        (1720, 102, 39, 22),
        (1810, 108, 42, 24),
        (1760, 104, 40, 22),
        (1900, 115, 44, 25),
        (1980, 121, 47, 27),
        (1870, 113, 43, 24),
        (2050, 126, 49, 28),
        (2140, 132, 52, 30),
        (2080, 129, 50, 29),
        (2210, 138, 54, 31),
        (2300, 145, 57, 33),
        (2240, 141, 55, 32),
        (2390, 151, 60, 35),
        (2480, 158, 63, 37),
    ]

    for index, (impressions, likes, comments, shares) in enumerate(values):
        date = today - timedelta(days=len(values) - 1 - index)

        data.append({
            "date": date.isoformat(),
            "impressions": impressions,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "engagements": likes + comments + shares,
        })

    return {
        "platform": "linkedin",
        "period": "last_30_days",
        "data": data,
        "is_mock": True,
    }


def get_mock_posts():
    return {
        "platform": "linkedin",
        "posts": [
            {
                "id": "mock-post-001",
                "text": "The future of AI is being built today. Here are 5 things every developer should know.",
                "published_at": "2026-09-28T10:30:00",
                "type": "article",
                "likes": 1840,
                "comments": 326,
                "shares": 142,
                "impressions": 28400,
                "engagement_rate": 8.13,
            },
            {
                "id": "mock-post-002",
                "text": "Building better software starts with understanding the people who use it.",
                "published_at": "2026-09-25T14:15:00",
                "type": "text",
                "likes": 1260,
                "comments": 218,
                "shares": 94,
                "impressions": 21300,
                "engagement_rate": 7.38,
            },
            {
                "id": "mock-post-003",
                "text": "A simple lesson from working with APIs: good architecture makes everything easier.",
                "published_at": "2026-09-22T09:45:00",
                "type": "text",
                "likes": 980,
                "comments": 156,
                "shares": 72,
                "impressions": 17800,
                "engagement_rate": 6.79,
            },
            {
                "id": "mock-post-004",
                "text": "What developers should know before starting their first AI project.",
                "published_at": "2026-09-18T11:00:00",
                "type": "article",
                "likes": 1540,
                "comments": 284,
                "shares": 118,
                "impressions": 24700,
                "engagement_rate": 7.86,
            },
            {
                "id": "mock-post-005",
                "text": "Three practical ways to improve your development workflow this week.",
                "published_at": "2026-09-15T16:20:00",
                "type": "text",
                "likes": 870,
                "comments": 132,
                "shares": 61,
                "impressions": 15200,
                "engagement_rate": 7.00,
            },
            {
                "id": "mock-post-006",
                "text": "Learning something new every day is still one of the best investments a developer can make.",
                "published_at": "2026-09-11T08:30:00",
                "type": "text",
                "likes": 720,
                "comments": 104,
                "shares": 48,
                "impressions": 12900,
                "engagement_rate": 6.76,
            },
        ],
        "is_mock": True,
    }


def get_mock_top_posts():
    posts = get_mock_posts()["posts"]

    sorted_posts = sorted(
        posts,
        key=lambda post: post["engagement_rate"],
        reverse=True
    )

    return {
        "platform": "linkedin",
        "posts": sorted_posts,
        "is_mock": True,
    }


def get_mock_audience():
    return {
        "platform": "linkedin",

        "countries": [
            {"country": "India", "percentage": 54.2},
            {"country": "United States", "percentage": 18.6},
            {"country": "United Kingdom", "percentage": 8.4},
            {"country": "Canada", "percentage": 5.7},
            {"country": "Australia", "percentage": 4.1},
            {"country": "Other", "percentage": 9.0},
        ],

        "job_titles": [
            {"title": "Software Engineer", "percentage": 22.4},
            {"title": "Product Manager", "percentage": 14.8},
            {"title": "Data Scientist", "percentage": 11.7},
            {"title": "Founder", "percentage": 9.6},
            {"title": "Marketing Manager", "percentage": 8.2},
            {"title": "Other", "percentage": 33.3},
        ],

        "industries": [
            {"industry": "Information Technology", "percentage": 31.5},
            {"industry": "Software", "percentage": 19.8},
            {"industry": "Marketing", "percentage": 12.7},
            {"industry": "Education", "percentage": 8.6},
            {"industry": "Finance", "percentage": 7.2},
            {"industry": "Other", "percentage": 20.2},
        ],

        "is_mock": True,
    }


def get_mock_growth():
    return {
        "platform": "linkedin",

        "followers": {
            "current": 25400,
            "previous": 23370,
            "growth": 8.7,
        },

        "engagement": {
            "current": 6.87,
            "previous": 6.12,
            "growth": 12.25,
        },

        "impressions": {
            "current": 184500,
            "previous": 161400,
            "growth": 14.31,
        },

        "is_mock": True,
    }