"use client";

import { useState, useEffect, useCallback } from "react";
import { signalRService } from "@/lib/signalr";
import { ChatMessage } from "@/types";
import * as signalR from "@microsoft/signalr";

export function useChat(token: string, gameId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    const conn = signalRService.getChatConnection(token);
    setConnection(conn);

    conn.on("ChatHistory", (history: ChatMessage[]) => {
      setMessages(history);
    });

    conn.on("ReceiveMessage", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    if (conn.state === signalR.HubConnectionState.Disconnected) {
      conn.start()
        .then(() => {
          conn.invoke("JoinChat", gameId);
        })
        .catch(console.error);
    } else {
      conn.invoke("JoinChat", gameId);
    }

    return () => {
      conn.off("ChatHistory");
      conn.off("ReceiveMessage");
      if (conn.state === signalR.HubConnectionState.Connected) {
        conn.invoke("LeaveChat", gameId).catch(console.error);
      }
    };
  }, [token, gameId]);

  const sendMessage = useCallback(async (message: string) => {
    if (!connection || !message.trim()) return;
    try {
      await connection.invoke("SendMessage", token, gameId, message);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [connection, token, gameId]);

  return { messages, sendMessage };
}
