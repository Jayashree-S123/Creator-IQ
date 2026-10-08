import os
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from dotenv import load_dotenv


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

GITHUB_API = "https://api.github.com"

GITHUB_HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "CreatorIQ",
}


class GitHubAPIError(Exception):
    pass


# =========================================================
# COMMON REQUEST
# =========================================================

def github_request(endpoint: str, params=None, token=None):
    """
    Make a request to GitHub API.

    Uses the explicitly supplied token when available.
    Otherwise falls back to GITHUB_TOKEN from .env.
    """

    access_token = token or GITHUB_TOKEN

    headers = GITHUB_HEADERS.copy()

    if access_token:
        headers["Authorization"] = f"Bearer {access_token}"

    try:
        response = requests.get(
            f"{GITHUB_API}{endpoint}",
            params=params,
            headers=headers,
            timeout=15,
        )
    except requests.RequestException as exc:
        raise GitHubAPIError(
            f"GitHub connection error: {exc}"
        ) from exc

    if not response.ok:
        raise GitHubAPIError(
            f"GitHub API error {response.status_code}: "
            f"{response.text[:500]}"
        )

    try:
        return response.json()
    except ValueError as exc:
        raise GitHubAPIError(
            "GitHub returned an invalid JSON response."
        ) from exc


# =========================================================
# USER SEARCH
# =========================================================

def search_users(query: str, per_page: int = 20):
    data = github_request(
        "/search/users",
        params={
            "q": query,
            "per_page": per_page,
        },
    )

    return {
        "total": data.get("total_count", 0),
        "users": [
            {
                "id": str(user["id"]),
                "username": user["login"],
                "avatar": user.get("avatar_url"),
                "profile_url": user["html_url"],
                "type": user.get("type"),
            }
            for user in data.get("items", [])
        ],
        "is_mock": False,
    }


# =========================================================
# REPOSITORY SEARCH
# =========================================================

def search_repositories(query: str, per_page: int = 20):
    data = github_request(
        "/search/repositories",
        params={
            "q": query,
            "per_page": per_page,
        },
    )

    return {
        "total": data.get("total_count", 0),
        "repositories": [
            {
                "id": str(repo["id"]),
                "name": repo["name"],
                "full_name": repo["full_name"],
                "description": repo.get("description") or "",
                "owner": repo["owner"]["login"],
                "language": repo.get("language"),
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0),
                "open_issues": repo.get("open_issues_count", 0),
                "watchers": repo.get("watchers_count", 0),
                "url": repo["html_url"],
                "updated_at": repo.get("updated_at"),
                "is_private": repo.get("private", False),
            }
            for repo in data.get("items", [])
        ],
        "is_mock": False,
    }


# =========================================================
# USER PROFILE
# =========================================================

def get_profile(username: str, token=None):
    data = github_request(
        f"/users/{username}",
        token=token,
    )

    return {
        "id": str(data["id"]),
        "username": data["login"],
        "name": data.get("name") or data["login"],
        "bio": data.get("bio") or "",
        "location": data.get("location") or "",
        "company": data.get("company") or "",
        "profile_url": data["html_url"],
        "avatar": data.get("avatar_url"),
        "followers": data.get("followers", 0),
        "following": data.get("following", 0),
        "public_repositories": data.get("public_repos", 0),
        "public_gists": data.get("public_gists", 0),
        "is_mock": False,
    }


# =========================================================
# USER REPOSITORIES
# =========================================================

def get_repositories(username: str, token=None):
    data = github_request(
        f"/users/{username}/repos",
        params={
            "per_page": 100,
            "sort": "updated",
        },
        token=token,
    )

    repositories = []

    for repo in data:
        repositories.append({
            "id": str(repo["id"]),
            "name": repo["name"],
            "full_name": repo["full_name"],
            "description": repo.get("description") or "",
            "language": repo.get("language") or "Unknown",
            "stars": repo.get("stargazers_count", 0),
            "forks": repo.get("forks_count", 0),
            "open_issues": repo.get("open_issues_count", 0),
            "watchers": repo.get("watchers_count", 0),
            "updated_at": repo.get("updated_at"),
            "url": repo["html_url"],
            "is_private": repo.get("private", False),
        })

    return {
        "platform": "github",
        "repositories": repositories,
        "is_mock": False,
    }


# =========================================================
# SINGLE REPOSITORY
# =========================================================

def get_repository(owner: str, repo: str, token=None):
    data = github_request(
        f"/repos/{owner}/{repo}",
        token=token,
    )

    return {
        "id": str(data["id"]),
        "name": data["name"],
        "full_name": data["full_name"],
        "description": data.get("description") or "",
        "owner": data["owner"]["login"],
        "language": data.get("language"),
        "stars": data.get("stargazers_count", 0),
        "forks": data.get("forks_count", 0),
        "watchers": data.get("watchers_count", 0),
        "open_issues": data.get("open_issues_count", 0),
        "default_branch": data.get("default_branch"),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
        "pushed_at": data.get("pushed_at"),
        "url": data["html_url"],
        "is_fork": data.get("fork", False),
        "is_archived": data.get("archived", False),
        "is_private": data.get("private", False),
        "topics": data.get("topics", []),
        "is_mock": False,
    }


# =========================================================
# TOP REPOSITORIES
# =========================================================

def get_top_repositories(username: str, token=None):
    repositories = get_repositories(
        username,
        token
    )["repositories"]

    repositories.sort(
        key=lambda repo: (
            repo["stars"],
            repo["forks"],
        ),
        reverse=True,
    )

    return {
        "platform": "github",
        "repositories": repositories[:10],
        "is_mock": False,
    }


# =========================================================
# LANGUAGES
# =========================================================

def get_languages(username: str, token=None):
    repositories = get_repositories(
        username,
        token
    )["repositories"]

    counts = {}

    for repo in repositories:
        language = repo.get("language")

        if language and language != "Unknown":
            counts[language] = counts.get(language, 0) + 1

    total = sum(counts.values())

    languages = []

    if total:
        for language, count in sorted(
            counts.items(),
            key=lambda item: item[1],
            reverse=True,
        ):
            languages.append({
                "language": language,
                "percentage": round(
                    (count / total) * 100,
                    1,
                ),
            })

    return {
        "platform": "github",
        "languages": languages,
        "is_mock": False,
    }


# =========================================================
# ISSUES
# =========================================================

def get_issues(
    owner: str,
    repo: str,
    state: str = "all",
    per_page: int = 30,
    token=None,
):
    data = github_request(
        f"/repos/{owner}/{repo}/issues",
        params={
            "state": state,
            "per_page": per_page,
        },
        token=token,
    )

    issues = []

    for issue in data:
        issues.append({
            "id": str(issue["id"]),
            "number": issue["number"],
            "title": issue["title"],
            "state": issue["state"],
            "author": issue["user"]["login"],
            "comments": issue.get("comments", 0),
            "created_at": issue.get("created_at"),
            "updated_at": issue.get("updated_at"),
            "closed_at": issue.get("closed_at"),
            "url": issue["html_url"],
            "is_pull_request": "pull_request" in issue,
        })

    return {
        "repository": f"{owner}/{repo}",
        "issues": issues,
        "is_mock": False,
    }


# =========================================================
# ISSUE COMMENTS
# =========================================================

def get_issue_comments(
    owner: str,
    repo: str,
    issue_number: int,
    per_page: int = 30,
    token=None,
):
    data = github_request(
        f"/repos/{owner}/{repo}/issues/{issue_number}/comments",
        params={
            "per_page": per_page,
        },
        token=token,
    )

    comments = []

    for comment in data:
        comments.append({
            "id": str(comment["id"]),
            "author": comment["user"]["login"],
            "body": comment.get("body") or "",
            "created_at": comment.get("created_at"),
            "updated_at": comment.get("updated_at"),
            "url": comment["html_url"],
        })

    return {
        "repository": f"{owner}/{repo}",
        "issue_number": issue_number,
        "comments": comments,
        "is_mock": False,
    }


# =========================================================
# PULL REQUESTS
# =========================================================

def get_pull_requests(
    owner: str,
    repo: str,
    state: str = "all",
    per_page: int = 30,
    token=None,
):
    data = github_request(
        f"/repos/{owner}/{repo}/pulls",
        params={
            "state": state,
            "per_page": per_page,
        },
        token=token,
    )

    pull_requests = []

    for pr in data:
        pull_requests.append({
            "id": str(pr["id"]),
            "number": pr["number"],
            "title": pr["title"],
            "state": pr["state"],
            "draft": pr.get("draft", False),
            "author": pr["user"]["login"],
            "comments": pr.get("comments", 0),
            "commits": pr.get("commits", 0),
            "changed_files": pr.get("changed_files", 0),
            "additions": pr.get("additions", 0),
            "deletions": pr.get("deletions", 0),
            "created_at": pr.get("created_at"),
            "updated_at": pr.get("updated_at"),
            "merged_at": pr.get("merged_at"),
            "url": pr["html_url"],
        })

    return {
        "repository": f"{owner}/{repo}",
        "pull_requests": pull_requests,
        "is_mock": False,
    }


# =========================================================
# PULL REQUEST REVIEWS
# =========================================================

def get_pull_request_reviews(
    owner: str,
    repo: str,
    pull_number: int,
    per_page: int = 30,
    token=None,
):
    data = github_request(
        f"/repos/{owner}/{repo}/pulls/{pull_number}/reviews",
        params={
            "per_page": per_page,
        },
        token=token,
    )

    reviews = []

    for review in data:
        reviews.append({
            "id": str(review["id"]),
            "author": review["user"]["login"],
            "state": review.get("state"),
            "body": review.get("body") or "",
            "submitted_at": review.get("submitted_at"),
            "url": review["html_url"],
        })

    return {
        "repository": f"{owner}/{repo}",
        "pull_number": pull_number,
        "reviews": reviews,
        "is_mock": False,
    }


# =========================================================
# COMMITS
# =========================================================

def get_commits(
    owner: str,
    repo: str,
    per_page: int = 30,
    token=None,
):
    data = github_request(
        f"/repos/{owner}/{repo}/commits",
        params={
            "per_page": per_page,
        },
        token=token,
    )

    commits = []

    for commit in data:
        author = commit.get("author") or {}
        commit_data = commit.get("commit") or {}

        commits.append({
            "sha": commit.get("sha"),
            "author": author.get("login"),
            "author_name": (
                commit_data.get("author") or {}
            ).get("name"),
            "message": commit_data.get("message"),
            "date": (
                commit_data.get("author") or {}
            ).get("date"),
            "url": commit.get("html_url"),
        })

    return {
        "repository": f"{owner}/{repo}",
        "commits": commits,
        "is_mock": False,
    }


# =========================================================
# CONTRIBUTORS
# =========================================================

def get_contributors(
    owner: str,
    repo: str,
    per_page: int = 30,
    token=None,
):
    data = github_request(
        f"/repos/{owner}/{repo}/contributors",
        params={
            "per_page": per_page,
        },
        token=token,
    )

    contributors = []

    for user in data:
        contributors.append({
            "username": user["login"],
            "avatar": user.get("avatar_url"),
            "profile_url": user["html_url"],
            "contributions": user.get(
                "contributions",
                0,
            ),
        })

    return {
        "repository": f"{owner}/{repo}",
        "contributors": contributors,
        "is_mock": False,
    }


# =========================================================
# FOLLOWERS
# =========================================================

def get_followers(
    username: str,
    per_page: int = 30,
    token=None,
):
    data = github_request(
        f"/users/{username}/followers",
        params={
            "per_page": per_page,
        },
        token=token,
    )

    return {
        "username": username,
        "followers": [
            {
                "username": user["login"],
                "avatar": user.get("avatar_url"),
                "profile_url": user["html_url"],
            }
            for user in data
        ],
        "is_mock": False,
    }


# =========================================================
# FOLLOWING
# =========================================================

def get_following(
    username: str,
    per_page: int = 30,
    token=None,
):
    data = github_request(
        f"/users/{username}/following",
        params={
            "per_page": per_page,
        },
        token=token,
    )

    return {
        "username": username,
        "following": [
            {
                "username": user["login"],
                "avatar": user.get("avatar_url"),
                "profile_url": user["html_url"],
            }
            for user in data
        ],
        "is_mock": False,
    }


# =========================================================
# STARRED REPOSITORIES
# =========================================================

def get_starred_repositories(
    username: str,
    per_page: int = 30,
    token=None,
):
    data = github_request(
        f"/users/{username}/starred",
        params={
            "per_page": per_page,
        },
        token=token,
    )

    repositories = []

    for repo in data:
        repositories.append({
            "name": repo["name"],
            "full_name": repo["full_name"],
            "owner": repo["owner"]["login"],
            "description": repo.get("description") or "",
            "stars": repo.get("stargazers_count", 0),
            "forks": repo.get("forks_count", 0),
            "language": repo.get("language"),
            "url": repo["html_url"],
        })

    return {
        "username": username,
        "repositories": repositories,
        "is_mock": False,
    }


# =========================================================
# ACTIVITY / EVENTS
# =========================================================

def get_activity(
    username: str,
    per_page: int = 30,
    token=None,
):
    data = github_request(
        f"/users/{username}/events/public",
        params={
            "per_page": per_page,
        },
        token=token,
    )

    events = []

    for event in data:
        events.append({
            "id": event.get("id"),
            "type": event.get("type"),
            "repo": (
                event.get("repo") or {}
            ).get("name"),
            "created_at": event.get("created_at"),
            "actor": (
                event.get("actor") or {}
            ).get("login"),
        })

    return {
        "username": username,
        "events": events,
        "is_mock": False,
    }


# =========================================================
# FAST REPOSITORY DETAIL WORKER
# =========================================================

def _get_repository_details(
    username: str,
    repo: dict,
    token=None,
):
    """
    Fetch detailed information for one repository.

    This function is executed concurrently by
    get_advanced_analytics().
    """

    repo_name = repo["name"]

    result = {
        **repo,
        "commits": 0,
        "issues": 0,
        "pull_requests": 0,
    }

    # -----------------------------------------------------
    # Issues
    # -----------------------------------------------------

    try:
        issues_data = get_issues(
            username,
            repo_name,
            state="all",
            per_page=100,
            token=token,
        )

        issues = issues_data.get(
            "issues",
            [],
        )

        result["issues"] = len([
            issue
            for issue in issues
            if not issue.get(
                "is_pull_request",
                False,
            )
        ])

    except GitHubAPIError:
        result["issues"] = 0

    # -----------------------------------------------------
    # Pull Requests
    # -----------------------------------------------------

    try:
        pull_requests_data = get_pull_requests(
            username,
            repo_name,
            state="all",
            per_page=100,
            token=token,
        )

        result["pull_requests"] = len(
            pull_requests_data.get(
                "pull_requests",
                [],
            )
        )

    except GitHubAPIError:
        result["pull_requests"] = 0

    # -----------------------------------------------------
    # Commits
    # -----------------------------------------------------

    try:
        commits_data = get_commits(
            username,
            repo_name,
            per_page=100,
            token=token,
        )

        result["commits"] = len(
            commits_data.get(
                "commits",
                [],
            )
        )

    except GitHubAPIError:
        result["commits"] = 0

    return result


# =========================================================
# ADVANCED ANALYTICS - OPTIMIZED
# =========================================================

def get_advanced_analytics(
    username: str,
    token=None,
):
    """
    Optimized advanced GitHub analytics.

    Previous implementation:
        Every repository was processed sequentially.

    New implementation:
        1. Fetch profile once.
        2. Fetch repositories once.
        3. Calculate basic repository metrics locally.
        4. Select the top repositories for detailed analytics.
        5. Fetch issue/PR/commit information concurrently.
        6. Fetch supporting profile-level information concurrently.

    This dramatically reduces waiting time.
    """

    access_token = token or GITHUB_TOKEN

    if not access_token:
        raise GitHubAPIError(
            "GITHUB_TOKEN is not configured."
        )

    # -----------------------------------------------------
    # 1. PROFILE + REPOSITORIES
    # -----------------------------------------------------

    with ThreadPoolExecutor(
        max_workers=2
    ) as executor:

        profile_future = executor.submit(
            get_profile,
            username,
            access_token,
        )

        repositories_future = executor.submit(
            get_repositories,
            username,
            access_token,
        )

        profile = profile_future.result()

        repositories_data = repositories_future.result()

    repositories = repositories_data.get(
        "repositories",
        [],
    )

    # -----------------------------------------------------
    # 2. BASIC METRICS
    # -----------------------------------------------------

    total_stars = sum(
        repo.get("stars", 0)
        for repo in repositories
    )

    total_forks = sum(
        repo.get("forks", 0)
        for repo in repositories
    )

    total_open_issues = sum(
        repo.get("open_issues", 0)
        for repo in repositories
    )

    # -----------------------------------------------------
    # 3. SELECT TOP REPOSITORIES
    #
    # Detailed API calls are limited to 10 repositories.
    # This is the biggest performance improvement.
    # -----------------------------------------------------

    sorted_repositories = sorted(
        repositories,
        key=lambda repo: (
            repo.get("stars", 0),
            repo.get("forks", 0),
        ),
        reverse=True,
    )

    detailed_repositories = sorted_repositories[:10]

    repository_analytics = []

    # -----------------------------------------------------
    # 4. RUN REPOSITORY ANALYTICS IN PARALLEL
    # -----------------------------------------------------

    if detailed_repositories:

        max_workers = min(
            10,
            len(detailed_repositories),
        )

        with ThreadPoolExecutor(
            max_workers=max_workers
        ) as executor:

            futures = {
                executor.submit(
                    _get_repository_details,
                    username,
                    repo,
                    access_token,
                ): repo["name"]
                for repo in detailed_repositories
            }

            for future in as_completed(futures):
                try:
                    result = future.result()
                    repository_analytics.append(result)

                except Exception:
                    repo_name = futures[future]

                    repository_analytics.append({
                        **next(
                            (
                                repo
                                for repo in detailed_repositories
                                if repo["name"] == repo_name
                            ),
                            {},
                        ),
                        "commits": 0,
                        "issues": 0,
                        "pull_requests": 0,
                    })

    # Preserve ranking order.
    repository_analytics.sort(
        key=lambda repo: (
            repo.get("stars", 0),
            repo.get("forks", 0),
        ),
        reverse=True,
    )

    # -----------------------------------------------------
    # 5. CALCULATE DETAILED TOTALS
    # -----------------------------------------------------

    total_issues = sum(
        repo.get("issues", 0)
        for repo in repository_analytics
    )

    total_pull_requests = sum(
        repo.get("pull_requests", 0)
        for repo in repository_analytics
    )

    total_commits = sum(
        repo.get("commits", 0)
        for repo in repository_analytics
    )

    # -----------------------------------------------------
    # 6. PROFILE-LEVEL REQUESTS IN PARALLEL
    # -----------------------------------------------------

    with ThreadPoolExecutor(
        max_workers=4
    ) as executor:

        languages_future = executor.submit(
            get_languages,
            username,
            access_token,
        )

        followers_future = executor.submit(
            get_followers,
            username,
            30,
            access_token,
        )

        following_future = executor.submit(
            get_following,
            username,
            30,
            access_token,
        )

        activity_future = executor.submit(
            get_activity,
            username,
            30,
            access_token,
        )

        languages = languages_future.result()
        followers = followers_future.result()
        following = following_future.result()
        activity = activity_future.result()

    # -----------------------------------------------------
    # 7. TOP REPOSITORIES
    # -----------------------------------------------------

    top_repositories = repository_analytics[:10]

    # -----------------------------------------------------
    # 8. FINAL RESPONSE
    # -----------------------------------------------------

    return {
        "profile": profile,

        "summary": {
            "followers": profile.get(
                "followers",
                0,
            ),

            "following": profile.get(
                "following",
                0,
            ),

            "repositories": len(
                repositories
            ),

            "stars": total_stars,

            "forks": total_forks,

            "open_issues": total_open_issues,

            "issues": total_issues,

            "pull_requests": total_pull_requests,

            "commits": total_commits,

            "followers_loaded": len(
                followers.get(
                    "followers",
                    [],
                )
            ),

            "following_loaded": len(
                following.get(
                    "following",
                    [],
                )
            ),

            "activity_events": len(
                activity.get(
                    "events",
                    [],
                )
            ),
        },

        # All repositories are still returned here,
        # preserving repository visibility.
        "repositories": repositories,

        "top_repositories": {
            "platform": "github",
            "repositories": top_repositories,
            "is_mock": False,
        },

        "languages": languages,

        "followers": followers,

        "following": following,

        "activity": activity,

        "is_mock": False,
    }