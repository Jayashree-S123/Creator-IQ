from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.models.user import User

from app.services.github import (
    search_users,
    search_repositories,
    get_profile,
    get_repositories,
    get_repository,
 get_advanced_analytics,
    get_top_repositories,
    get_languages,
    get_issues,
    get_issue_comments,
    get_pull_requests,
    get_pull_request_reviews,
    get_commits,
    get_contributors,
    get_followers,
    get_following,
    get_starred_repositories,
    get_activity,
)


from app.services.github_mock import (
    get_mock_profile,
    get_mock_connection,
    get_mock_overview,
    get_mock_daily_activity,
    get_mock_repositories,
    get_mock_top_repositories,
    get_mock_languages,
    get_mock_growth,
)


router = APIRouter(
    prefix="/github",
    tags=["GitHub"],
)


@router.get("/connection")
def github_connection(
    current_user: User = Depends(get_current_user),
):
    return get_mock_connection()


@router.get("/profile")
def github_profile(
    current_user: User = Depends(get_current_user),
):
    return get_mock_profile()


@router.get("/analytics/overview")
def github_analytics_overview(
    current_user: User = Depends(get_current_user),
):
    return get_mock_overview()


@router.get("/analytics/daily")
def github_analytics_daily(
    current_user: User = Depends(get_current_user),
):
    return get_mock_daily_activity()


@router.get("/analytics/top-repositories")
def github_top_repositories(
    current_user: User = Depends(get_current_user),
):
    return get_mock_top_repositories()


@router.get("/analytics/languages")
def github_languages(
    current_user: User = Depends(get_current_user),
):
    return get_mock_languages()


@router.get("/analytics/growth")
def github_growth(
    current_user: User = Depends(get_current_user),
):
    return get_mock_growth()


@router.get("/repositories")
def github_repositories(
    current_user: User = Depends(get_current_user),
):
    return get_mock_repositories()


# =========================================================
# REAL GITHUB API
# =========================================================

@router.get("/real/search/users")
def real_search_users(
    q: str,
    per_page: int = 20,
    current_user: User = Depends(get_current_user),
):
    return search_users(q, per_page)


@router.get("/real/search/repositories")
def real_search_repositories(
    q: str,
    per_page: int = 20,
    current_user: User = Depends(get_current_user),
):
    return search_repositories(q, per_page)


@router.get("/real/profile/{username}")
def real_profile(
    username: str,
    current_user: User = Depends(get_current_user),
):
    return get_profile(username)


@router.get("/real/{username}/repositories")
def real_repositories(
    username: str,
    current_user: User = Depends(get_current_user),
):
    return get_repositories(username)


@router.get("/real/repository/{owner}/{repo}")
def real_repository(
    owner: str,
    repo: str,
    current_user: User = Depends(get_current_user),
):
    return get_repository(owner, repo)


@router.get("/real/{username}/top-repositories")
def real_top_repositories(
    username: str,
    current_user: User = Depends(get_current_user),
):
    return get_top_repositories(username)


@router.get("/real/{username}/languages")
def real_languages(
    username: str,
    current_user: User = Depends(get_current_user),
):
    return get_languages(username)


@router.get("/real/{owner}/{repo}/issues")
def real_issues(
    owner: str,
    repo: str,
    state: str = "all",
    current_user: User = Depends(get_current_user),
):
    return get_issues(owner, repo, state)


@router.get("/real/{owner}/{repo}/issues/{issue_number}/comments")
def real_issue_comments(
    owner: str,
    repo: str,
    issue_number: int,
    current_user: User = Depends(get_current_user),
):
    return get_issue_comments(owner, repo, issue_number)


@router.get("/real/{owner}/{repo}/pulls")
def real_pull_requests(
    owner: str,
    repo: str,
    state: str = "all",
    current_user: User = Depends(get_current_user),
):
    return get_pull_requests(owner, repo, state)


@router.get("/real/{owner}/{repo}/pulls/{pull_number}/reviews")
def real_pull_request_reviews(
    owner: str,
    repo: str,
    pull_number: int,
    current_user: User = Depends(get_current_user),
):
    return get_pull_request_reviews(owner, repo, pull_number)


@router.get("/real/{owner}/{repo}/commits")
def real_commits(
    owner: str,
    repo: str,
    current_user: User = Depends(get_current_user),
):
    return get_commits(owner, repo)


@router.get("/real/{owner}/{repo}/contributors")
def real_contributors(
    owner: str,
    repo: str,
    current_user: User = Depends(get_current_user),
):
    return get_contributors(owner, repo)


@router.get("/real/{username}/followers")
def real_followers(
    username: str,
    current_user: User = Depends(get_current_user),
):
    return get_followers(username)


@router.get("/real/{username}/following")
def real_following(
    username: str,
    current_user: User = Depends(get_current_user),
):
    return get_following(username)


@router.get("/real/{username}/starred")
def real_starred(
    username: str,
    current_user: User = Depends(get_current_user),
):
    return get_starred_repositories(username)


@router.get("/real/{username}/activity")
def real_activity(
    username: str,
    current_user: User = Depends(get_current_user),
):
    return get_activity(username)


# ---------------------------------------------------------
# ADVANCED REAL GITHUB ANALYTICS
# ---------------------------------------------------------

@router.get("/real/{username}/advanced")
def real_advanced_analytics(
    username: str,
    current_user: User = Depends(get_current_user),
):
    return get_advanced_analytics(username)




