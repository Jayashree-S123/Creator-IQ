from datetime import date, timedelta


YOUTUBE_CHANNELS = [
    {
        "id": "UC-924xRiveraDemo",
        "name": "Alex Rivera Tech",
        "handle": "@alexriveratech",
        "description": "Technology, AI, productivity and creator tools.",
        "subscribers": 542800,
        "subscriber_change": 24800,
        "views": 4800000,
        "likes": 386000,
        "comments": 42000,
        "watch_time_hours": 64500,
        "watch_time_change": 18.2,
        "impressions": 1800000,
        "ctr": 8.4,
        "avg_view_duration": "4m 48s",
        "retention": 56.4,
        "videos": 126,
        "verified_partner": True,
    },
    {
        "id": "UC-PriyaAIHubDemo",
        "name": "Priya AI Hub",
        "handle": "@priyaaihub",
        "description": "AI tools, automation, coding and practical tutorials.",
        "subscribers": 328400,
        "subscriber_change": 18400,
        "views": 2900000,
        "likes": 241000,
        "comments": 28000,
        "watch_time_hours": 41200,
        "watch_time_change": 15.6,
        "impressions": 1240000,
        "ctr": 8.9,
        "avg_view_duration": "5m 02s",
        "retention": 59.8,
        "videos": 94,
        "verified_partner": True,
    },
    {
        "id": "UC-TechWithPriyaDemo",
        "name": "Tech With Priya",
        "handle": "@techwithpriya",
        "description": "Developer tutorials, software reviews and tech guides.",
        "subscribers": 185600,
        "subscriber_change": 12300,
        "views": 1700000,
        "likes": 139000,
        "comments": 16000,
        "watch_time_hours": 24800,
        "watch_time_change": 13.8,
        "impressions": 760000,
        "ctr": 7.8,
        "avg_view_duration": "4m 21s",
        "retention": 54.2,
        "videos": 78,
        "verified_partner": False,
    },
    {
        "id": "UC-CreatorCodeLabDemo",
        "name": "Creator Code Lab",
        "handle": "@creatorcodelab",
        "description": "Programming, creator technology and full-stack projects.",
        "subscribers": 96300,
        "subscriber_change": 8200,
        "views": 890000,
        "likes": 72000,
        "comments": 8400,
        "watch_time_hours": 13600,
        "watch_time_change": 11.4,
        "impressions": 420000,
        "ctr": 8.1,
        "avg_view_duration": "5m 15s",
        "retention": 61.1,
        "videos": 51,
        "verified_partner": False,
    },
    {
        "id": "UC-AIExplainedDailyDemo",
        "name": "AI Explained Daily",
        "handle": "@aiexplaineddaily",
        "description": "Daily AI news, tools, trends and easy explanations.",
        "subscribers": 54700,
        "subscriber_change": 5100,
        "views": 510000,
        "likes": 43000,
        "comments": 5100,
        "watch_time_hours": 8200,
        "watch_time_change": 9.8,
        "impressions": 260000,
        "ctr": 7.6,
        "avg_view_duration": "3m 56s",
        "retention": 52.7,
        "videos": 43,
        "verified_partner": False,
    },
]


VIDEO_DATA = {
    "UC-924xRiveraDemo": [
        {
            "title": "Top 10 AI Tools That Changed My Productivity in 2026",
            "views": 184500,
            "watch_hours": 14200,
            "ctr": 8.4,
            "duration": "4:36",
            "retention": 58.2,
        },
        {
            "title": "Clean Minimalist Desk Setup 2026 — Ultimate Tour",
            "views": 312000,
            "watch_hours": 26800,
            "ctr": 9.2,
            "duration": "5:10",
            "retention": 62.4,
        },
        {
            "title": "Why I am officially switching from Chrome to Zen Browser",
            "views": 92400,
            "watch_hours": 7100,
            "ctr": 7.1,
            "duration": "4:40",
            "retention": 51.8,
        },
        {
            "title": "How I Built a 6-Figure Creator Business on YouTube",
            "views": 142000,
            "watch_hours": 16400,
            "ctr": 8.8,
            "duration": "6:55",
            "retention": 64.0,
        },
        {
            "title": "My Complete AI Coding Workflow",
            "views": 126500,
            "watch_hours": 10200,
            "ctr": 8.1,
            "duration": "5:22",
            "retention": 57.6,
        },
    ],

    "UC-PriyaAIHubDemo": [
        {
            "title": "15 AI Tools You Need to Try in 2026",
            "views": 248000,
            "watch_hours": 19800,
            "ctr": 9.4,
            "duration": "5:02",
            "retention": 63.2,
        },
        {
            "title": "I Tested 20 AI Coding Assistants",
            "views": 221000,
            "watch_hours": 17600,
            "ctr": 9.1,
            "duration": "5:14",
            "retention": 61.8,
        },
        {
            "title": "Build Your First AI App With Python",
            "views": 184000,
            "watch_hours": 14100,
            "ctr": 8.7,
            "duration": "6:08",
            "retention": 59.6,
        },
        {
            "title": "Best AI Productivity Workflow",
            "views": 156000,
            "watch_hours": 11800,
            "ctr": 8.3,
            "duration": "4:48",
            "retention": 57.9,
        },
        {
            "title": "AI Agents Explained Simply",
            "views": 139000,
            "watch_hours": 10900,
            "ctr": 8.8,
            "duration": "5:26",
            "retention": 60.4,
        },
    ],

    "UC-TechWithPriyaDemo": [
        {
            "title": "Complete React Tutorial for Beginners",
            "views": 198000,
            "watch_hours": 15200,
            "ctr": 8.5,
            "duration": "6:12",
            "retention": 58.7,
        },
        {
            "title": "10 VS Code Extensions I Use Every Day",
            "views": 176000,
            "watch_hours": 12400,
            "ctr": 8.2,
            "duration": "4:18",
            "retention": 55.4,
        },
        {
            "title": "Build a Dashboard With React",
            "views": 153000,
            "watch_hours": 11900,
            "ctr": 7.9,
            "duration": "6:03",
            "retention": 57.2,
        },
        {
            "title": "JavaScript Tips That Save Me Hours",
            "views": 128000,
            "watch_hours": 9200,
            "ctr": 7.6,
            "duration": "4:10",
            "retention": 53.9,
        },
        {
            "title": "My Full Stack Developer Setup",
            "views": 116000,
            "watch_hours": 8600,
            "ctr": 7.8,
            "duration": "5:02",
            "retention": 56.1,
        },
    ],

    "UC-CreatorCodeLabDemo": [
        {
            "title": "I Built a Full Creator Analytics Dashboard",
            "views": 142000,
            "watch_hours": 10800,
            "ctr": 8.6,
            "duration": "5:32",
            "retention": 62.1,
        },
        {
            "title": "FastAPI + React Full Stack Tutorial",
            "views": 128000,
            "watch_hours": 9900,
            "ctr": 8.1,
            "duration": "6:18",
            "retention": 60.2,
        },
        {
            "title": "Build Your First REST API",
            "views": 112000,
            "watch_hours": 8100,
            "ctr": 7.9,
            "duration": "5:04",
            "retention": 57.6,
        },
        {
            "title": "How I Structure My React Projects",
            "views": 96000,
            "watch_hours": 7200,
            "ctr": 7.7,
            "duration": "4:42",
            "retention": 55.9,
        },
        {
            "title": "Developer Productivity Tools",
            "views": 87000,
            "watch_hours": 6500,
            "ctr": 7.5,
            "duration": "4:20",
            "retention": 54.8,
        },
    ],

    "UC-AIExplainedDailyDemo": [
        {
            "title": "What Happened in AI This Week?",
            "views": 112000,
            "watch_hours": 6500,
            "ctr": 8.3,
            "duration": "3:58",
            "retention": 55.2,
        },
        {
            "title": "5 AI Features You Missed",
            "views": 98000,
            "watch_hours": 5700,
            "ctr": 7.9,
            "duration": "3:42",
            "retention": 53.8,
        },
        {
            "title": "AI Agents in 5 Minutes",
            "views": 91000,
            "watch_hours": 5400,
            "ctr": 8.1,
            "duration": "4:05",
            "retention": 56.4,
        },
        {
            "title": "The Future of AI Coding",
            "views": 84000,
            "watch_hours": 4900,
            "ctr": 7.4,
            "duration": "3:51",
            "retention": 51.9,
        },
        {
            "title": "AI Tools for Students and Creators",
            "views": 79000,
            "watch_hours": 4600,
            "ctr": 7.8,
            "duration": "3:46",
            "retention": 54.1,
        },
    ],
}


TRAFFIC_SOURCES = {
    "UC-924xRiveraDemo": {
        "YouTube Browse Features": 48,
        "Suggested Videos": 28,
        "YouTube Search": 14,
        "External & Direct Links": 6,
        "Other Channel Pages": 4,
    },
    "UC-PriyaAIHubDemo": {
        "YouTube Browse Features": 42,
        "Suggested Videos": 31,
        "YouTube Search": 17,
        "External & Direct Links": 6,
        "Other Channel Pages": 4,
    },
    "UC-TechWithPriyaDemo": {
        "YouTube Browse Features": 39,
        "Suggested Videos": 29,
        "YouTube Search": 21,
        "External & Direct Links": 7,
        "Other Channel Pages": 4,
    },
    "UC-CreatorCodeLabDemo": {
        "YouTube Browse Features": 36,
        "Suggested Videos": 34,
        "YouTube Search": 20,
        "External & Direct Links": 6,
        "Other Channel Pages": 4,
    },
    "UC-AIExplainedDailyDemo": {
        "YouTube Browse Features": 44,
        "Suggested Videos": 25,
        "YouTube Search": 22,
        "External & Direct Links": 5,
        "Other Channel Pages": 4,
    },
}


def get_channel(channel_id: str):
    for channel in YOUTUBE_CHANNELS:
        if channel["id"] == channel_id:
            return channel

    return YOUTUBE_CHANNELS[0]


def get_mock_youtube_channels():
    return {
        "channels": YOUTUBE_CHANNELS,
        "is_mock": True,
    }


def get_mock_youtube_overview(channel_id: str):
    channel = get_channel(channel_id)

    return {
        **channel,
        "channel_id": channel["id"],
        "period": "last_28_days",
        "is_mock": True,
    }


def get_mock_youtube_videos(channel_id: str):
    return {
        "channel_id": channel_id,
        "videos": VIDEO_DATA.get(
            channel_id,
            VIDEO_DATA["UC-924xRiveraDemo"]
        ),
        "is_mock": True,
    }


def get_mock_youtube_traffic(channel_id: str):
    sources = TRAFFIC_SOURCES.get(
        channel_id,
        TRAFFIC_SOURCES["UC-924xRiveraDemo"]
    )

    return {
        "channel_id": channel_id,
        "sources": [
            {
                "source": name,
                "percentage": percentage,
            }
            for name, percentage in sources.items()
        ],
        "is_mock": True,
    }


def get_mock_youtube_daily(channel_id: str):
    channel = get_channel(channel_id)

    base = channel["watch_time_hours"] / 28

    multipliers = [
        0.72, 0.81, 0.76, 0.91,
        0.88, 1.02, 0.96, 1.08,
        1.00, 1.12, 1.05, 1.18,
        1.11, 1.20, 1.14, 1.25,
        1.18, 1.29, 1.22, 1.34,
        1.27, 1.39, 1.31, 1.44,
        1.38, 1.48, 1.42, 1.55,
    ]

    today = date.today()
    data = []

    for index, multiplier in enumerate(multipliers):
        current_date = today - timedelta(days=27 - index)

        data.append({
            "date": current_date.isoformat(),
            "watch_time_hours": round(base * multiplier, 2),
        })

    return {
        "channel_id": channel_id,
        "period": "last_28_days",
        "data": data,
        "is_mock": True,
    }