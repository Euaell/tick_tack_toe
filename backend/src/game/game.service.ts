import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { ConfigurationService } from 'src/configuration/configuration.service';

@Injectable()
export class GameService {
  constructor(
    private readonly configService: ConfigurationService,
  ) {
    this.client.connect();
  }

  private client = createClient({ url: this.configService.get('REDIS_URL') });

  async createGame(gameId: string, clientId: string) {
    const game = {
      board: Array(9).fill(null),
      players: [clientId],
      currentPlayer: 0,
      history: [Array(9).fill(null)],
    };
    await this.client.set(`game:${gameId}`, JSON.stringify(game));
    return game;
  }

  async joinGame(gameId: string, clientId: string) {
    // if (!this.games[gameId]) {
    //   return this.createGame(gameId, clientId);
    // }
    // if (this.games[gameId].players.length < 2 && !this.games[gameId].players.includes(clientId)) {
    //   this.games[gameId].players.push(clientId);
    // }
    // return this.games[gameId];
    const game = await this.client.get(`game:${gameId}`);
    if (!game) {
      return this.createGame(gameId, clientId);
    }
    const parsedGame = JSON.parse(game);
    if (parsedGame.players.length < 2 && !parsedGame.players.includes(clientId)) {
      parsedGame.players.push(clientId);
    }
    await this.client.set(`game:${gameId}`, JSON.stringify(parsedGame));
    return parsedGame;
  }

  makeMove(gameId: string, clientId: string, index: number) {
    // const game = this.games[gameId];
    // if (game && game.players[game.currentPlayer] === clientId) {
    //   const newBoard = [...game.board];
    //   newBoard[index] = game.currentPlayer === 0 ? 'X' : 'O';
    //   game.board = newBoard;
    //   game.history.push(newBoard);
    //   game.currentPlayer = 1 - game.currentPlayer;
    // }
    // return game;
    return this.client.get(`game:${gameId}`).then((game) => {
      const parsedGame = JSON.parse(game);
      if (parsedGame && parsedGame.players[parsedGame.currentPlayer] === clientId) {
        const newBoard = [...parsedGame.board];
        newBoard[index] = parsedGame.currentPlayer === 0 ? 'X' : 'O';
        parsedGame.board = newBoard;
        parsedGame.history.push(newBoard);
        parsedGame.currentPlayer = 1 - parsedGame.currentPlayer;
        return this.client.set(`game:${gameId}`, JSON.stringify(parsedGame)).then(() => parsedGame);
      }
      return parsedGame;
    });
  }

  async getGame(gameId: string) {
    // return this.games[gameId];
    const game = await this.client.get(`game:${gameId}`);
    return JSON.parse(game);
  }

  async getAllGames() {
    // return Object.keys(this.games);
    const keys = await this.client.keys('game:*');
    return keys.map((key) => key.split(':')[1]);
  }

  async cleanup(gameId: string) {
    // delete this.games[gameId];
    await this.client.del(`game:${gameId}`);
  }
}
