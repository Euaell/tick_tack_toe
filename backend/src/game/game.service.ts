import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  private games: Record<string, any> = {};

  createGame(gameId: string, clientId: string) {
    this.games[gameId] = {
      board: Array(9).fill(null),
      players: [clientId],
      currentPlayer: 0,
      history: [Array(9).fill(null)],
    };
    return this.games[gameId];
  }

  joinGame(gameId: string, clientId: string) {
    if (!this.games[gameId]) {
      return this.createGame(gameId, clientId);
    }
    if (this.games[gameId].players.length < 2 && !this.games[gameId].players.includes(clientId)) {
      this.games[gameId].players.push(clientId);
    }
    return this.games[gameId];
  }

  makeMove(gameId: string, clientId: string, index: number) {
    const game = this.games[gameId];
    if (game && game.players[game.currentPlayer] === clientId) {
      const newBoard = [...game.board];
      newBoard[index] = game.currentPlayer === 0 ? 'X' : 'O';
      game.board = newBoard;
      game.history.push(newBoard);
      game.currentPlayer = 1 - game.currentPlayer;
    }
    return game;
  }

  getGame(gameId: string) {
    return this.games[gameId];
  }

  getAllGames() {
    return this.games;
  }

  cleanup(gameId: string) {
    delete this.games[gameId];
  }
}
