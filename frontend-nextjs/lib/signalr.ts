import * as signalR from "@microsoft/signalr";
import { getApiUrl } from "./env";

const API_URL = getApiUrl();

export class SignalRService {
  private gameConnection: signalR.HubConnection | null = null;
  private chatConnection: signalR.HubConnection | null = null;
  private matchmakingConnection: signalR.HubConnection | null = null;

  getGameConnection(token: string): signalR.HubConnection {
    if (!this.gameConnection) {
      this.gameConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/hubs/game`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();
    }
    return this.gameConnection;
  }

  getChatConnection(token: string): signalR.HubConnection {
    if (!this.chatConnection) {
      this.chatConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/hubs/chat`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();
    }
    return this.chatConnection;
  }

  getMatchmakingConnection(token: string): signalR.HubConnection {
    if (!this.matchmakingConnection) {
      this.matchmakingConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_URL}/hubs/matchmaking`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .build();
    }
    return this.matchmakingConnection;
  }

  async disconnectAll() {
    if (this.gameConnection) {
      await this.gameConnection.stop();
      this.gameConnection = null;
    }
    if (this.chatConnection) {
      await this.chatConnection.stop();
      this.chatConnection = null;
    }
    if (this.matchmakingConnection) {
      await this.matchmakingConnection.stop();
      this.matchmakingConnection = null;
    }
  }
}

export const signalRService = new SignalRService();
