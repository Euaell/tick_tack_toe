import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from '@/components/Board';
import ChatBox from '@/components/ChatBox';
import { calculateWinner, isDraw } from '@/helpers';
import socket from '@/socket';

type Square = 'X' | 'O' | null;

interface GameState {
  board: Square[];
  history: Square[][];
  currentPlayer: 'X' | 'O';
}

const initialGameState: GameState = {
  board: Array(9).fill(null),
  history: [Array(9).fill(null)],
  currentPlayer: 'X',
};

export default function Game(): React.ReactElement {
  const [game, setGame] = useState<GameState>(initialGameState);
  const [gameId, setGameId] = useState('');
  const { gameId: paramGameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [winningCombination, setWinningCombination] = useState<number[] | null>(null);
  const [restartRequested, setRestartRequested] = useState(false);

  const handleGameUpdate = useCallback((updatedGame: GameState) => {
    setGame((prevGame) => {
      const validBoard = Array.isArray(updatedGame.board) && updatedGame.board.length === 9
        ? updatedGame.board
        : prevGame.board;

      const newGame = {
        ...updatedGame,
        board: validBoard,
        currentPlayer: updatedGame.currentPlayer || prevGame.currentPlayer,
        history: Array.isArray(updatedGame.history) ? updatedGame.history : prevGame.history,
      };

      const result = calculateWinner(newGame.board);
      if (result) {
        setWinningCombination(result.winningCombination);
      } else {
        setWinningCombination(null);
      }

      return newGame;
    });
  }, []);

  useEffect(() => {
    if (!paramGameId) {
      // Fetch new gameId from backend
      fetch('http://localhost:8080/game', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          const newGameId = data.gameId;
          setGameId(newGameId);
          navigate(`/${newGameId}`);
          // Now join the game
          socket.emit('joinGame', newGameId);
          socket.emit('requestGameState', newGameId);
        })
        .catch(err => {
          console.error('Error creating new game:', err);
        });
    } else {
      setGameId(paramGameId);

      // Join the game
      socket.emit('joinGame', paramGameId);
      socket.emit('requestGameState', paramGameId);
    }

    return () => {
      if (paramGameId || gameId) {
        socket.emit('leaveGame', paramGameId || gameId);
      }
    };
  }, [paramGameId, navigate, gameId]);

  useEffect(() => {
    socket.on('gameUpdate', handleGameUpdate);

    return () => {
      socket.off('gameUpdate', handleGameUpdate);
    };
  }, [handleGameUpdate]);

  useEffect(() => {
    const handleConnectError = (error: Error) => {
      console.error('Socket connection error:', error);
    };

    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  const handleClick = useCallback((i: number) => {
    if (calculateWinner(game.board) || game.board[i]) return;
    socket.emit('makeMove', { gameId: paramGameId || gameId, index: i });
  }, [game.board, gameId, paramGameId]);

  const renderStatus = useCallback(() => {
    const result = calculateWinner(game.board);
    if (result) {
      return `Winner: ${result.winner}`;
    } else if (isDraw(game.board)) {
      return "It's a tie!";
    } else {
      return `Next Player: ${game.currentPlayer}`;
    }
  }, [game.board, game.currentPlayer]);

  const handleRestart = useCallback(() => {
    setRestartRequested(true);
    socket.emit('requestRestart', { gameId: paramGameId || gameId });
  }, [gameId, paramGameId]);

  useEffect(() => {
    const handleRestartRequest = () => {
      if (window.confirm('Your opponent wants to restart the game. Do you agree?')) {
        socket.emit('confirmRestart', { gameId: paramGameId || gameId, accept: true });
      } else {
        socket.emit('confirmRestart', { gameId: paramGameId || gameId, accept: false });
      }
    };

    socket.on('restartRequest', handleRestartRequest);

    const handleRestartConfirmed = (data: { accept: boolean }) => {
      if (data.accept) {
        // Restart the game
        setGame(initialGameState);
        setWinningCombination(null);
        setRestartRequested(false);
      } else {
        alert('Your opponent declined the restart request.');
        setRestartRequested(false);
      }
    };

    socket.on('restartConfirmed', handleRestartConfirmed);

    return () => {
      socket.off('restartRequest', handleRestartRequest);
      socket.off('restartConfirmed', handleRestartConfirmed);
    };
  }, [gameId, paramGameId]);

  return (
    <div className="game">
      <h1>Tic Tac Toe</h1>
      <Board
        squares={game.board}
        onClick={handleClick}
        winningCombination={winningCombination}
      />
      <div id='status' aria-live="polite">{renderStatus()}</div>
      <p>
        Share this link to invite another player:
        <br />
        <a href={window.location.href}>{window.location.href}</a>
      </p>
      <button onClick={handleRestart} disabled={restartRequested}>
        {restartRequested ? 'Waiting for opponent...' : 'Restart Game'}
      </button>
      <ChatBox gameId={gameId} />
    </div>
  );
}
