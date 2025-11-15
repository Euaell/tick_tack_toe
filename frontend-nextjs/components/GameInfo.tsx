"use client";

import { GameState, GameStatus, PlayerSymbol } from "@/types";

interface GameInfoProps {
  gameState: GameState;
  mySymbol: PlayerSymbol | null;
  onRequestRestart?: () => void;
  onShareLink?: () => void;
}

export function GameInfo({ gameState, mySymbol, onRequestRestart, onShareLink }: GameInfoProps) {
  const getStatusMessage = () => {
    switch (gameState.status) {
      case GameStatus.WaitingForPlayers:
        return "Waiting for opponent...";
      case GameStatus.InProgress:
        if (mySymbol !== null && gameState.currentTurn === mySymbol) {
          return "Your turn!";
        }
        return "Opponent's turn...";
      case GameStatus.Completed:
        if (gameState.winner === mySymbol) {
          return "You won! 🎉";
        }
        return "You lost 😢";
      case GameStatus.Draw:
        return "It's a draw!";
      case GameStatus.Abandoned:
        return "Game abandoned";
      default:
        return "";
    }
  };

  const getPlayerInfo = (symbol: PlayerSymbol) => {
    const isX = symbol === PlayerSymbol.X;
    const username = isX ? gameState.playerXUsername : gameState.playerOUsername;
    const connected = isX ? gameState.playerXConnected : gameState.playerOConnected;
    const isMe = mySymbol === symbol;

    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg ${isMe ? "bg-blue-100" : "bg-gray-100"}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
          isX ? "bg-blue-600 text-white" : "bg-red-600 text-white"
        }`}>
          {isX ? "X" : "O"}
        </div>
        <div className="flex-1">
          <div className="font-semibold">
            {username || "Waiting..."}
            {isMe && " (You)"}
          </div>
          <div className={`text-sm ${connected ? "text-green-600" : "text-gray-400"}`}>
            {connected ? "Connected" : "Disconnected"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Tic Tac Toe</h2>
        <p className="text-lg font-semibold text-blue-600">{getStatusMessage()}</p>
      </div>

      <div className="space-y-2">
        {getPlayerInfo(PlayerSymbol.X)}
        {getPlayerInfo(PlayerSymbol.O)}
      </div>

      {gameState.status === GameStatus.WaitingForPlayers && onShareLink && (
        <button
          onClick={onShareLink}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Share Game Link
        </button>
      )}

      {(gameState.status === GameStatus.Completed || gameState.status === GameStatus.Draw) && onRequestRestart && (
        <button
          onClick={onRequestRestart}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Request Rematch
        </button>
      )}

      <div className="text-xs text-gray-500 text-center">
        Game ID: {gameState.id.substring(0, 8)}...
      </div>
    </div>
  );
}
