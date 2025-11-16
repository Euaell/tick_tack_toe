"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Leaderboard } from "@/components/Leaderboard";
import { LeaderboardResponse } from "@/types";
import { getLeaderboard } from "@/lib/api";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  const loadLeaderboard = async () => {
    try {
      const result = await getLeaderboard(user?.token);
      setData(result);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Failed to load leaderboard</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">Leaderboard</h1>
      <Leaderboard
        topPlayers={data.topPlayers}
        currentPlayer={data.currentPlayer}
      />
    </div>
  );
}
