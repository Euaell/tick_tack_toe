"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { useGame } from "@/hooks/useGame";
import { WaitingRoom } from "@/components/WaitingRoom";

export default function LobbyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const matchmaking = useMatchmaking(user?.token || "");
  const game = useGame(user?.token || "");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (matchmaking.matchedGame) {
      router.push(`/game/${matchmaking.matchedGame.id}`);
    }
  }, [matchmaking.matchedGame, router]);

  const handleCreateGame = async () => {
    try {
      const gameState = await game.createGame();
      if (gameState) {
        router.push(`/game/${gameState.id}`);
      }
    } catch (error) {
      console.error("Failed to create game:", error);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user.username}!</h1>
        <p className="text-gray-600">Choose how you want to play</p>
      </div>

      <WaitingRoom
        isQueued={matchmaking.isQueued}
        onJoinQueue={matchmaking.joinQueue}
        onLeaveQueue={matchmaking.leaveQueue}
        onCreateGame={handleCreateGame}
      />
    </div>
  );
}
