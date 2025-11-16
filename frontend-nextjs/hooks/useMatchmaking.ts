"use client";

import { useState, useEffect, useCallback } from "react";
import { signalRService } from "@/lib/signalr";
import { GameState } from "@/types";
import * as signalR from "@microsoft/signalr";

export function useMatchmaking(token: string) {
  const [isQueued, setIsQueued] = useState(false);
  const [matchedGame, setMatchedGame] = useState<GameState | null>(null);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    const conn = signalRService.getMatchmakingConnection(token);
    setConnection(conn);

    conn.on("QueueJoined", () => {
      setIsQueued(true);
    });

    conn.on("MatchFound", (gameState: GameState) => {
      setIsQueued(false);
      setMatchedGame(gameState);
    });

    conn.on("QueueLeft", () => {
      setIsQueued(false);
    });

    if (conn.state === signalR.HubConnectionState.Disconnected) {
      conn.start().catch(console.error);
    }

    return () => {
      conn.off("QueueJoined");
      conn.off("MatchFound");
      conn.off("QueueLeft");
    };
  }, [token]);

  const joinQueue = useCallback(async () => {
    if (!connection) return;
    try {
      await connection.invoke("JoinQueue", token);
    } catch (error) {
      console.error("Failed to join queue:", error);
    }
  }, [connection, token]);

  const leaveQueue = useCallback(async () => {
    if (!connection) return;
    try {
      await connection.invoke("LeaveQueue", token);
      setIsQueued(false);
    } catch (error) {
      console.error("Failed to leave queue:", error);
    }
  }, [connection, token]);

  return { isQueued, matchedGame, joinQueue, leaveQueue };
}
