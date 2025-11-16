"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGame } from "@/hooks/useGame";
import { useChat } from "@/hooks/useChat";
import { Board } from "@/components/Board";
import { ChatBox } from "@/components/ChatBox";
import { GameInfo } from "@/components/GameInfo";

export default function GamePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const gameId = params.id as string;

  const game = useGame(user?.token || "", gameId);
  const chat = useChat(user?.token || "", gameId);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleCellClick = async (position: number) => {
    try {
      await game.makeMove(position);
    } catch (error) {
      console.error("Failed to make move:", error);
    }
  };

  const handleShareLink = () => {
    const link = `${window.location.origin}/game/${gameId}`;
    navigator.clipboard.writeText(link);
    alert("Game link copied to clipboard!");
  };

  const handleRequestRestart = async () => {
    try {
      await game.requestRestart();
      alert("Restart request sent to opponent");
    } catch (error) {
      console.error("Failed to request restart:", error);
    }
  };

  if (loading || !user || !game.gameState) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <GameInfo
              gameState={game.gameState}
              mySymbol={game.mySymbol}
              onRequestRestart={handleRequestRestart}
              onShareLink={handleShareLink}
            />
          </div>
        </div>

        <div className="lg:col-span-1 flex items-center justify-center">
          <Board
            gameState={game.gameState}
            onCellClick={handleCellClick}
            mySymbol={game.mySymbol}
          />
        </div>

        <div className="lg:col-span-1">
          <ChatBox
            messages={chat.messages}
            onSendMessage={chat.sendMessage}
            currentUserId={user.userId}
          />
        </div>
      </div>
    </div>
  );
}
