import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {
  private games: Record<string, any> = {};

  createGame(gameId: string, clientId: string) {
    this.games[gameId] = {
      board: Array(9).fill(null),
      players: [clientId],
      currentPlayer: 0,
      chat: []
    };
  }

  joinGame(gameId: string, clientId: string) {
    if (this.games[gameId].players.length < 2) {
      this.games[gameId].players.push(clientId);
    }
    return this.games[gameId];
  }

  makeMove(gameId: string, clientId: string, index: number) {
    const game = this.games[gameId];
    if (game.players[game.currentPlayer] === clientId) {
      game.board[index] = game.currentPlayer === 0 ? 'X' : 'O';
      game.currentPlayer = 1 - game.currentPlayer;
    }
    return game;
  }

  cleanup(gameId: string) {
    delete this.games[gameId];
  }

  getGame(gameId: string) {
    return this.games[gameId];
  }
}
