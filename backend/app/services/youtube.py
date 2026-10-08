import os
from datetime import datetime, timezone
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("YOUTUBE_API_KEY")
BASE = "https://www.googleapis.com/youtube/v3"

class YouTubeAPIError(Exception):
    pass

def _get(resource, params):
    if not API_KEY:
        raise YouTubeAPIError("YOUTUBE_API_KEY is not configured")
    params = {**params, "key": API_KEY}
    response = requests.get(f"{BASE}/{resource}", params=params, timeout=20)
    if not response.ok:
        try:
            detail = response.json().get("error", {}).get("message", response.text)
        except Exception:
            detail = response.text
        raise YouTubeAPIError(detail)
    return response.json()

def search_channels(query, max_results=10):
    data = _get("search", {"part": "snippet", "q": query, "type": "channel", "maxResults": max_results})
    ids = [x["snippet"]["channelId"] for x in data.get("items", [])]
    if not ids:
        return []
    details = _get("channels", {"part": "snippet,statistics,contentDetails", "id": ",".join(ids)})
    return [normalize_channel(x) for x in details.get("items", [])]

def get_channel(channel_id):
    data = _get("channels", {"part": "snippet,statistics,contentDetails", "id": channel_id})
    items = data.get("items", [])
    return normalize_channel(items[0]) if items else None

def get_channel_videos(channel_id, max_results=10):
    data = _get("search", {"part": "snippet", "channelId": channel_id, "type": "video", "order": "date", "maxResults": max_results})
    ids = [x["id"]["videoId"] for x in data.get("items", [])]
    if not ids:
        return []
    details = _get("videos", {"part": "snippet,statistics,contentDetails", "id": ",".join(ids)})
    return [normalize_video(x) for x in details.get("items", [])]

def get_trending(region_code="IN", max_results=10):
    data = _get("videos", {"part": "snippet,statistics,contentDetails", "chart": "mostPopular", "regionCode": region_code, "maxResults": max_results})
    return [normalize_video(x) for x in data.get("items", [])]

def normalize_channel(x):
    s = x.get("statistics", {})
    sn = x.get("snippet", {})
    return {
        "platform": "youtube",
        "channel_id": x.get("id"),
        "title": sn.get("title"),
        "description": sn.get("description"),
        "custom_url": sn.get("customUrl"),
        "thumbnail": sn.get("thumbnails", {}).get("high", sn.get("thumbnails", {}).get("default", {})).get("url"),
        "published_at": sn.get("publishedAt"),
        "subscribers": int(s.get("subscriberCount", 0)),
        "views": int(s.get("viewCount", 0)),
        "videos": int(s.get("videoCount", 0)),
        "hidden_subscriber_count": s.get("hiddenSubscriberCount", False),
    }

def normalize_video(x):
    s = x.get("statistics", {})
    sn = x.get("snippet", {})
    return {
        "video_id": x.get("id"),
        "title": sn.get("title"),
        "description": sn.get("description"),
        "thumbnail": sn.get("thumbnails", {}).get("high", sn.get("thumbnails", {}).get("default", {})).get("url"),
        "published_at": sn.get("publishedAt"),
        "channel_id": sn.get("channelId"),
        "channel_title": sn.get("channelTitle"),
        "views": int(s.get("viewCount", 0)),
        "likes": int(s.get("likeCount", 0)),
        "comments": int(s.get("commentCount", 0)),
    }

def creator_search(query):
    channels = search_channels(query, 10)
    results = []
    for channel in channels:
        videos = get_channel_videos(channel["channel_id"], 5)
        results.append({"name": channel["title"], "platforms": {"youtube": channel}, "recent_content": videos})
    return results

