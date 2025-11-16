"use client";

interface WaitingRoomProps {
  isQueued: boolean;
  onJoinQueue: () => void;
  onLeaveQueue: () => void;
  onCreateGame: () => void;
}

export function WaitingRoom({ isQueued, onJoinQueue, onLeaveQueue, onCreateGame }: WaitingRoomProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Tic Tac Toe</h2>

      {isQueued ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">Searching for opponent...</p>
            <p className="text-gray-600 mt-2">Please wait while we find you a match</p>
          </div>
          <button
            onClick={onLeaveQueue}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Cancel Search
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-center text-gray-600 mb-6">
            Choose how you want to play
          </p>

          <button
            onClick={onJoinQueue}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            Find Random Opponent
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={onCreateGame}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
          >
            Create Private Game
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            Create a private game to play with a friend using a shared link
          </p>
        </div>
      )}
    </div>
  );
}
