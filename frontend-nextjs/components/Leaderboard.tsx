"use client";

import { LeaderboardEntry, PlayerStatistics } from "@/types";

interface LeaderboardProps {
  topPlayers: LeaderboardEntry[];
  currentPlayer?: PlayerStatistics;
}

export function Leaderboard({ topPlayers, currentPlayer }: LeaderboardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Leaderboard</h2>

      <div className="space-y-2">
        {topPlayers.map((player, index) => (
          <div
            key={player.userId}
            className={`flex items-center gap-4 p-3 rounded-lg ${
              player.userId === currentPlayer?.userId
                ? "bg-blue-100 border-2 border-blue-500"
                : "bg-gray-50"
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              index === 0 ? "bg-yellow-500 text-white" :
              index === 1 ? "bg-gray-400 text-white" :
              index === 2 ? "bg-orange-600 text-white" :
              "bg-gray-300 text-gray-700"
            }`}>
              {index + 1}
            </div>

            <div className="flex-1">
              <div className="font-semibold">{player.username}</div>
              <div className="text-sm text-gray-600">
                {player.totalGames} games
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-lg">
                {(player.winRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                {player.wins}W {player.losses}L {player.draws}D
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentPlayer && !topPlayers.find(p => p.userId === currentPlayer.userId) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Your Stats</h3>
          <div className="flex items-center gap-4 p-3 rounded-lg bg-blue-50">
            <div className="flex-1">
              <div className="font-semibold">{currentPlayer.username}</div>
              <div className="text-sm text-gray-600">
                {currentPlayer.totalGames} games
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg">
                {(currentPlayer.winRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                {currentPlayer.wins}W {currentPlayer.losses}L {currentPlayer.draws}D
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
