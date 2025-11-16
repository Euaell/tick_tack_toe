export enum GameStatus {
  WaitingForPlayers = 0,
  InProgress = 1,
  Completed = 2,
  Draw = 3,
  Abandoned = 4,
}

export enum PlayerSymbol {
  X = 0,
  O = 1,
}

export interface User {
  id: string;
  username: string;
  isAnonymous: boolean;
  statistics?: PlayerStatistics;
}

export interface PlayerStatistics {
  userId: string;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winRate: number;
}

export interface GameState {
  id: string;
  playerXId?: string;
  playerOId?: string;
  playerXUsername?: string;
  playerOUsername?: string;
  playerXConnected: boolean;
  playerOConnected: boolean;
  status: GameStatus;
  currentTurn: PlayerSymbol;
  winner?: PlayerSymbol;
  winningLine?: number[];
  board: string[];
  createdAt: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  message: string;
  sentAt: string;
}

export interface LeaderboardEntry extends PlayerStatistics {}

export interface LeaderboardResponse {
  topPlayers: LeaderboardEntry[];
  currentPlayer?: PlayerStatistics;
}
