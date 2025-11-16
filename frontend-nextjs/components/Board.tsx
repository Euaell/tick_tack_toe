"use client";

import { GameState, PlayerSymbol, GameStatus } from "@/types";

interface BoardProps {
  gameState: GameState;
  onCellClick: (position: number) => void;
  mySymbol: PlayerSymbol | null;
}

export function Board({ gameState, onCellClick, mySymbol }: BoardProps) {
  const isMyTurn = mySymbol !== null && gameState.currentTurn === mySymbol;
  const isGameActive = gameState.status === GameStatus.InProgress;

  const getCellValue = (position: number) => {
    return gameState.board[position] || "";
  };

  const isCellInWinningLine = (position: number) => {
    return gameState.winningLine?.includes(position);
  };

  const handleClick = (position: number) => {
    if (!isGameActive || !isMyTurn || getCellValue(position)) return;
    onCellClick(position);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-3 gap-2 w-80 h-80">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((position) => {
          const value = getCellValue(position);
          const isWinning = isCellInWinningLine(position);
          const isClickable = isGameActive && isMyTurn && !value;

          return (
            <button
              key={position}
              onClick={() => handleClick(position)}
              disabled={!isClickable}
              className={`
                aspect-square border-4 border-gray-700 rounded-lg
                text-6xl font-bold transition-all duration-200
                ${isClickable ? "hover:bg-gray-100 cursor-pointer hover:scale-105" : "cursor-not-allowed"}
                ${isWinning ? "bg-green-200 animate-pulse" : "bg-white"}
                ${value === "X" ? "text-blue-600" : "text-red-600"}
              `}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
