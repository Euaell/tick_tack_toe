import React, { useState, useEffect, useCallback } from 'react';
import Board from '@/components/Board';
import ChatBox from '@/components/ChatBox';
import { calculateWinner } from '@/helpers';
import socket from '@/socket';
import { useParams, useNavigate } from 'react-router-dom';
import uuidv4 from '@/helpers/uuidv4';

export default function Game(): React.ReactElement {
  const [game, setGame] = useState({
    board: Array(9).fill(null),
    history: [Array(9).fill(null)],
    currentPlayer: 0,
  });
  const [gameId, setGameId] = useState('');
  const { gameId: paramGameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [winningCombination, setWinningCombination] = useState<number[] | null>(null);

  const handleGameUpdate = useCallback((updatedGame: any) => {
    setGame(updatedGame);
    const result = calculateWinner(updatedGame.board);
    if (result && result.winningCombination) {
      setWinningCombination(result.winningCombination);
    } else {
      setWinningCombination(null);
    }
  }, []);

  useEffect(() => {
    const id = paramGameId || uuidv4();
    setGameId(id);

    if (!paramGameId) {
      navigate(`/${id}`);
    }

    socket.emit('joinGame', id);

    socket.on('gameUpdate', handleGameUpdate);

    return () => {
      socket.off('gameUpdate', handleGameUpdate);
    };
  }, [paramGameId, navigate, handleGameUpdate, gameId]);

  function handleClick(i: number) {
    if (calculateWinner(game.board)?.winner || game.board[i]) return;
    socket.emit('makeMove', { gameId, index: i });
  }

  const renderStatus = () => {
    const result = calculateWinner(game.board);
    if (result?.winner) {
      return `Winner: ${result.winner}`;
    } else if (!game.board.includes(null)) {
      return "It's a tie!";
    } else {
      return `Next Player: ${game.currentPlayer === 0 ? 'X' : 'O'}`;
    }
  };

  return (
    <>
      <h1>Tic Tac Toe</h1>
      <Board
        squares={game.board}
        onClick={handleClick}
        winningCombination={winningCombination}
      />
      <div id='status'>{renderStatus()}</div>
      <ChatBox gameId={gameId} />
    </>
  );
}