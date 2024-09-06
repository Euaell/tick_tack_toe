import React, { useState, useEffect, useCallback } from "react";
import Board from "@/components/Board";
import ChatBox from "@/components/ChatBox";
import { calculateWinner } from "@/helpers";
import io from "socket.io-client";
import { useParams, useNavigate } from 'react-router-dom';
import uuidv4 from "@/helpers/uuidv4";

const socket = io('http://localhost:8080', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

const styles = {
  width: "200px",
  margin: "20px auto",
};

export default function Game(): React.ReactElement {
  const [game, setGame] = useState({ board: Array(9).fill(null), history: [Array(9).fill(null)], currentPlayer: 0 });
  const [gameId, setGameId] = useState('');
  const { gameId: paramGameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const handleGameUpdate = useCallback((updatedGame: any) => {
    setGame(updatedGame);
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
  }, [paramGameId, navigate, handleGameUpdate]);

  function handleClick(i: number) {
    if (calculateWinner(game.board) || game.board[i]) return;
    socket.emit('makeMove', { gameId, index: i });
  }

  function jumpTo(step: number) {
    // This functionality might need to be implemented on the server-side
    // For now, we'll just update the local state
    setGame(prevGame => ({
      ...prevGame,
      board: prevGame.history[step],
      currentPlayer: step % 2 === 0 ? 0 : 1,
    }));
  }

  function renderMoves() {
    return game.history.map((_step: any, move: number) => {
      const destination = move ? `Go to move #${move}` : "Go to start";
      return (
        <li key={move}>
          <button onClick={() => jumpTo(move)}>{destination}</button>
        </li>
      );
    });
  }

  const winner = calculateWinner(game.board);

  return (
    <>
      <Board squares={game.board} onClick={handleClick} />
      <div style={styles}>
        <p>{winner ? "Winner: " + winner : "Next Player: " + (game.currentPlayer === 0 ? "X" : "O")}</p>
        {renderMoves()}
        <p>Share this link to invite another player: 
          <a href={window.location.href}>{window.location.href}</a>
        </p>
      </div>
      <ChatBox gameId={gameId} />
    </>
  );
}
