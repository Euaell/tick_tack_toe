import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from '@/components/Board';
import ChatBox from '@/components/ChatBox';
import { calculateWinner, isDraw } from '@/helpers';
import socket from '@/socket';
import uuidv4 from '@/helpers/uuidv4';

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

  const handleGameUpdate = useCallback((updatedGame: GameState) => {
    setGame((prevGame) => {
      // Ensure the board is always an array of 9 elements
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
    const id = paramGameId || uuidv4();
    setGameId(id);

    if (!paramGameId) {
      navigate(`/${id}`);
    }

    socket.emit('joinGame', id);
    socket.emit('requestGameState', id);

    return () => {
      socket.emit('leaveGame', id);
    };
  }, [paramGameId, navigate]);

  useEffect(() => {
    socket.on('gameUpdate', handleGameUpdate);

    return () => {
      socket.off('gameUpdate', handleGameUpdate);
    };
  }, [handleGameUpdate]);

  useEffect(() => {
    const handleConnectError = (error: Error) => {
      console.error('Socket connection error:', error);
      // You might want to show an error message to the user here
    };

    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect_error', handleConnectError);
    };
  }, []);

  const handleClick = useCallback((i: number) => {
    if (calculateWinner(game.board) || game.board[i]) return;
    socket.emit('makeMove', { gameId, index: i });
  }, [game.board, gameId]);

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
      <ChatBox gameId={gameId} />
    </div>
  );
}
