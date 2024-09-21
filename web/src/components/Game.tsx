import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Board from '@/components/Board';
import ChatBox from '@/components/ChatBox';
import { calculateWinner, isDraw } from '@/helpers';
import socket, { api_url } from '@/socket';
import anime from 'animejs';

type Square = 'X' | 'O' | null;

interface GameState {
  board: Square[];
  history: Square[][];
  currentPlayer: 'X' | 'O';
  players: string[];
  playerSymbols: { [playerId: string]: 'X' | 'O' };
}

const initialGameState: GameState = {
  board: Array(9).fill(null),
  history: [Array(9).fill(null)],
  currentPlayer: 'X',
  players: [],
  playerSymbols: {},
};

export default function Game(): React.ReactElement {
  const [game, setGame] = useState<GameState>(initialGameState);
  const [gameId, setGameId] = useState('');
  const { gameId: paramGameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [winningCombination, setWinningCombination] = useState<number[] | null>(null);
  const [restartRequested, setRestartRequested] = useState(false);
  const [opponentStatus, setOpponentStatus] = useState('Waiting for opponent to join...');
  const [showLink, setShowLink] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O' | null>(null);

  // Animation functions
  const playWinnerAnimation = () => {
    anime({
      targets: '#winner-animation',
      opacity: [0, 1],
      scale: [0.5, 1],
      duration: 1000,
      easing: 'easeOutElastic(1, 0.5)',
    });
  };

  const playLoserAnimation = () => {
    anime({
      targets: '#loser-animation',
      opacity: [0, 1],
      scale: [0.5, 1],
      duration: 1000,
      easing: 'easeOutBounce',
    });
  }

  const playDrawAnimation = () => {
    anime({
      targets: '#draw-animation',
      opacity: [0, 1],
      scale: [0.5, 1],
      duration: 1000,
      easing: 'easeOutQuad',
    });
  };

  // Handle game updates
  const handleGameUpdate = useCallback((updatedGame: GameState) => {
      setGame((prevGame) => {
        const newGame = {
          ...updatedGame,
          board: updatedGame.board || prevGame.board,
          currentPlayer: updatedGame.currentPlayer || prevGame.currentPlayer,
          history: updatedGame.history || prevGame.history,
          players: updatedGame.players || prevGame.players,
          playerSymbols: updatedGame.playerSymbols || prevGame.playerSymbols,
        };

        // Set player's symbol
        if (!playerSymbol && newGame.playerSymbols && socket?.id) {
          const symbol = newGame.playerSymbols[socket.id];
          if (symbol) {
            setPlayerSymbol(symbol);
          }
        }

        // Update winning combination
        const result = calculateWinner(newGame.board);
        if (result) {
          setWinningCombination(result.winningCombination);
        } else {
          setWinningCombination(null);
        }

        // Update opponent status
        if (newGame.players.length === 2) {
          setOpponentStatus('Opponent connected.');
        } else {
          setOpponentStatus('Waiting for opponent to join...');
        }

        return newGame;
      });
    },
    [playerSymbol],
  );

  useEffect(() => {
    // Similar code for joining or creating a game
    if (!paramGameId) {
      // Fetch new gameId from backend
      fetch(`${api_url}/game`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          const newGameId = data.gameId;
          setGameId(newGameId);
          navigate(`/${newGameId}`);
          // Now join the game
          socket.emit('joinGame', newGameId);
        })
        .catch(err => {
          console.error('Error creating new game:', err);
        });
    } else {
      setGameId(paramGameId);

      // Join the game
      socket.emit('joinGame', paramGameId);
    }

    return () => {
      if (paramGameId || gameId) {
        socket.emit('leaveGame', paramGameId || gameId);
      }
    };
  }, [paramGameId, navigate, gameId]);

  useEffect(() => {
    socket.on('gameUpdate', handleGameUpdate);

    // Handle opponent connection
    const handlePlayerJoined = (data: { gameId: string; playerId: string }) => {
      setOpponentStatus('Opponent connected.');
      console.log('Opponent connected:', data.playerId);
    };

    // Handle opponent disconnection
    const handlePlayerLeft = (data: { gameId: string; playerId: string }) => {
      setOpponentStatus('Opponent disconnected.');
      console.log('Opponent disconnected:', data.playerId);
    };

    socket.on('playerJoined', handlePlayerJoined);
    socket.on('playerLeft', handlePlayerLeft);

    return () => {
      socket.off('gameUpdate', handleGameUpdate);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerLeft', handlePlayerLeft);
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

  // Add copy link functionality
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    }, () => {
      console.error('Failed to copy the link.');
    });
  };

  // Trigger animations on game end
  useEffect(() => {
    if (!playerSymbol) return;
  
    const result = calculateWinner(game.board);
    if (result) {
      const winnerSymbol = result.winner;
      if (playerSymbol === winnerSymbol) {
        playWinnerAnimation();
      } else {
        playLoserAnimation();
      }
    } else if (isDraw(game.board)) {
      playDrawAnimation();
    }
  }, [game.board, playerSymbol]);

  useEffect(() => {
    // Reset animations
    anime.set(['#winner-animation', '#loser-animation', 'draw-animation'], { opacity: 0 });
  }, [game]);

  return (
    <div className="game">
      <h1>Tic Tac Toe</h1>
      {/* Animation Containers */}
      <div id="winner-animation" className="animation-text">🎉 You Win! 🎉</div>
      <div id="loser-animation" className="animation-text">😢 You Lose 😢</div>
      <div id="draw-animation" className="animation-text">🤝 It's a Draw! 🤝</div>
      <Board
        squares={game.board}
        onClick={handleClick}
        winningCombination={winningCombination}
      />
      <div id='status' aria-live="polite">{renderStatus()}</div>
      <div className="opponent-status">{opponentStatus}</div>
      
      {/* Copy Link Button */}
      <div className="share-link">
        <button onClick={() => setShowLink(!showLink)}>
          {showLink ? 'Hide Invite Link' : 'Show Invite Link'}
        </button>
        {showLink && (
          <div className="link-section">
            <input type="text" value={window.location.href} readOnly />
            <button onClick={handleCopyLink}>
              {copySuccess ? 'Copied!' : 'Copy Link'}
            </button>
            {copySuccess && <div className="copy-animation">Link Copied!</div>}
          </div>
        )}
      </div>
      
      <button onClick={handleRestart} disabled={restartRequested}>
        {restartRequested ? 'Waiting for opponent...' : 'Restart Game'}
      </button>
      <ChatBox gameId={gameId} />
    </div>
  );
}
