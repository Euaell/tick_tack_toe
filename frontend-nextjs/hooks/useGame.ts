"use client";

import { useState, useEffect, useCallback } from "react";
import { signalRService } from "@/lib/signalr";
import { GameState, PlayerSymbol } from "@/types";
import * as signalR from "@microsoft/signalr";

export function useGame(token: string, gameId?: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [mySymbol, setMySymbol] = useState<PlayerSymbol | null>(null);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const conn = signalRService.getGameConnection(token);
    setConnection(conn);

    conn.on("GameUpdate", (state: GameState) => {
      setGameState(state);
    });

    conn.on("PlayerJoined", (state: GameState) => {
      setGameState(state);
    });

    conn.on("RestartRequested", (username: string) => {
      console.log(`${username} requested a restart`);
    });

    conn.on("RestartDeclined", () => {
      console.log("Restart request was declined");
    });

    conn.on("GameRestarted", (state: GameState) => {
      setGameState(state);
    });

    conn.on("PlayerReconnected", (username: string) => {
      console.log(`${username} reconnected`);
    });

    if (conn.state === signalR.HubConnectionState.Disconnected) {
      conn.start()
        .then(() => {
          setIsConnected(true);
          if (gameId) {
            joinGame(gameId);
          }
        })
        .catch(console.error);
    }

    return () => {
      conn.off("GameUpdate");
      conn.off("PlayerJoined");
      conn.off("RestartRequested");
      conn.off("RestartDeclined");
      conn.off("GameRestarted");
      conn.off("PlayerReconnected");
    };
  }, [token, gameId]);

  const createGame = useCallback(async () => {
    if (!connection) return;
    try {
      const response = await connection.invoke("CreateGame", token);
      setGameState(response.gameState);
      setMySymbol(response.assignedSymbol);
      return response.gameState;
    } catch (error) {
      console.error("Failed to create game:", error);
      throw error;
    }
  }, [connection, token]);

  const joinGame = useCallback(async (id: string) => {
    if (!connection) return;
    try {
      const response = await connection.invoke("JoinGame", token, id);
      if (response.success) {
        setGameState(response.gameState);
        setMySymbol(response.assignedSymbol);
      }
      return response;
    } catch (error) {
      console.error("Failed to join game:", error);
      throw error;
    }
  }, [connection, token]);

  const makeMove = useCallback(async (position: number) => {
    if (!connection || !gameState) return;
    try {
      const response = await connection.invoke("MakeMove", token, gameState.id, position);
      return response;
    } catch (error) {
      console.error("Failed to make move:", error);
      throw error;
    }
  }, [connection, token, gameState]);

  const requestRestart = useCallback(async () => {
    if (!connection || !gameState) return;
    try {
      await connection.invoke("RequestRestart", token, gameState.id);
    } catch (error) {
      console.error("Failed to request restart:", error);
    }
  }, [connection, token, gameState]);

  const confirmRestart = useCallback(async (accepted: boolean) => {
    if (!connection || !gameState) return;
    try {
      await connection.invoke("ConfirmRestart", token, gameState.id, accepted);
    } catch (error) {
      console.error("Failed to confirm restart:", error);
    }
  }, [connection, token, gameState]);

  return {
    gameState,
    mySymbol,
    isConnected,
    createGame,
    joinGame,
    makeMove,
    requestRestart,
    confirmRestart,
  };
}
