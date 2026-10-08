const API_URL = "http://127.0.0.1:8000";

export async function getRelatedProfiles(userId: number) {
  const response = await fetch(
    `${API_URL}/instagram/related-profiles?id=${userId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load Instagram profiles");
  }

  return response.json();
}

export async function getUserInfo(userId: number) {
  const response = await fetch(
    `${API_URL}/instagram/user-info?id=${userId}`
  );

  if (!response.ok) {
    throw new Error("Failed to load Instagram user information");
  }

  return response.json();
}

export async function getMediaList(userId: number, count = 12) {
  const response = await fetch(
    `${API_URL}/instagram/media?id=${userId}&count=${count}`
  );

  if (!response.ok) {
    throw new Error("Failed to load Instagram media");
  }

  return response.json();
}