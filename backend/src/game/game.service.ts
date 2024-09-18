import { Injectable } from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import { createClient } from 'redis';
import { ConfigurationService } from 'src/configuration/configuration.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GameService {
  private client: RedisClientType;

  constructor(
    private readonly configService: ConfigurationService,
  ) {
    this.client = createClient({ url: this.configService.get('REDIS_URL') });
    this.client.connect();
  }

  async createGame(gameId?: string) {
    const id = gameId || uuidv4();
    const game = {
      gameId: id,
      board: Array(9).fill(null),
      players: [],
      currentPlayer: 0,
      history: [Array(9).fill(null)],
    };
    await this.client.set(`game:${id}`, JSON.stringify(game));
    return game;
  }

  async joinGame(gameId: string, clientId: string) {
    const gameData = await this.client.get(`game:${gameId}`);
    if (!gameData) {
      // Game does not exist, create a new one
      const game = await this.createGame(gameId);
      if (clientId) {
        game.players.push(clientId);
        await this.updateGame(gameId, game);
      }
      return game;
    }
    const game = JSON.parse(gameData);
    if (game.players.length < 2 && !game.players.includes(clientId)) {
      game.players.push(clientId);
      await this.updateGame(gameId, game);
    }
    return game;
  }

  async makeMove(gameId: string, clientId: string, index: number) {
    const gameData = await this.client.get(`game:${gameId}`);
    if (gameData) {
      const game = JSON.parse(gameData);
      const currentSymbol = game.currentPlayer === 0 ? 'X' : 'O';
      if (game.players[game.currentPlayer] === clientId && !game.board[index]) {
        game.board[index] = currentSymbol;
        game.history.push([...game.board]);
        game.currentPlayer = 1 - game.currentPlayer;
        await this.updateGame(gameId, game);
        return game;
      }
      return game;
    }
    return null;
  }

  async getGame(gameId: string) {
    const gameData = await this.client.get(`game:${gameId}`);
    return gameData ? JSON.parse(gameData) : null;
  }

  async getAllGames() {
    const keys = await this.client.keys('game:*');
    return keys.map((key) => key.split(':')[1]);
  }

  async cleanup(gameId: string) {
    await this.client.del(`game:${gameId}`);
  }

  async updateGame(gameId: string, gameData: any) {
    await this.client.set(`game:${gameId}`, JSON.stringify(gameData));
  }

  async resetGame(gameId: string) {
    const gameData = await this.client.get(`game:${gameId}`);
    if (gameData) {
      const game = JSON.parse(gameData);
      game.board = Array(9).fill(null);
      game.currentPlayer = 0;
      game.history = [Array(9).fill(null)];
      await this.updateGame(gameId, game);
      return game;
    }
    return null;
  }
}
