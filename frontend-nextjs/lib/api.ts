const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface LoginResponse {
  userId: string;
  username: string;
  isAnonymous: boolean;
  token: string;
}

export async function login(username?: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username || null }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
}

export async function getLeaderboard(token?: string) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/leaderboard`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch leaderboard");
  }

  return response.json();
}
