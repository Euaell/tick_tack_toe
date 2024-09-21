import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigurationService } from 'src/configuration/configuration.service';
import { v4 as uuidv4 } from 'uuid';

interface Game {
  gameId: string;
  board: (string | null)[];
  players: string[];
  currentPlayer: number;
  history: (string | null)[][];
  playerSymbols: { [playerId: string]: 'X' | 'O' };
}

@Injectable()
export class GameService {
  private client: RedisClientType;

  constructor(private readonly configService: ConfigurationService) {
    this.client = createClient({
      url: this.configService.get('REDIS_URL'),
    });
    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client.connect().catch((err) => console.error('Redis Client Connection Error', err));
  }

  private getGameKey(gameId: string): string {
    return `game:${gameId}`;
  }

  async setGame(gameId: string, gameData: Game): Promise<void> {
    const key = this.getGameKey(gameId);
    await this.client.set(key, JSON.stringify(gameData));
    // Optionally, set an expiration time (e.g., 24 hours)
    await this.client.expire(key, 60 * 60 * 24);
  }

  /**
   * Creates a new game with an optional provided gameId.
   * If gameId is not provided, a new UUID is generated.
   */
  async createGame(gameId?: string): Promise<Game> {
    const id = gameId || uuidv4();
    const game: Game = {
      gameId: id,
      board: Array(9).fill(null),
      players: [],
      currentPlayer: 0,
      history: [Array(9).fill(null)],
      playerSymbols: {},
    };
    await this.setGame(id, game);
    return game;
  }

  /**
   * Allows a client to join a game. If the game doesn't exist, it creates a new one.
   * Adds the clientId to the game's players if there's room.
   */
  async joinGame(gameId: string, clientId: string): Promise<Game> {
    const key = this.getGameKey(gameId);
    let gameData = await this.client.get(key);

    if (!gameData) {
      const game = await this.createGame(gameId);
      if (clientId) {
        game.players.push(clientId);
        await this.setGame(gameId, game);
      }
      const playerIndex = game.players.findIndex((id) => id === clientId);
      game.playerSymbols[clientId] = playerIndex === 0 ? 'X' : 'O';
      return game;
    } else {
      const game: Game = JSON.parse(gameData);
      if (game.players.length < 2 && !game.players.includes(clientId)) {
        game.players.push(clientId);
        await this.setGame(gameId, game);
      }
      const playerIndex = game.players.findIndex((id) => id === clientId);
      game.playerSymbols[clientId] = playerIndex === 0 ? 'X' : 'O';
      return game;
    }
  }

  /**
   * Processes a player's move. Uses optimistic locking to ensure moves are processed atomically.
   */
  async makeMove(gameId: string, clientId: string, index: number): Promise<Game | null> {
    const key = this.getGameKey(gameId);
    let retries = 0;
    const maxRetries = 5;
    while (retries < maxRetries) {
      try {
        // Watch the key for changes
        await this.client.watch(key);
        const gameData = await this.client.get(key);
        if (!gameData) {
          await this.client.unwatch();
          return null;
        }
        const game: Game = JSON.parse(gameData);
        const currentSymbol = game.currentPlayer === 0 ? 'X' : 'O';
        if (game.players[game.currentPlayer] !== clientId || game.board[index]) {
          await this.client.unwatch();
          return game; // Invalid move
        }
        // Update game state
        game.board[index] = currentSymbol;
        game.history.push([...game.board]);
        game.currentPlayer = 1 - game.currentPlayer;

        const multi = this.client.multi();
        multi.set(key, JSON.stringify(game));
        // Optionally reset expiration time
        multi.expire(key, 60 * 60 * 24);
        const execResult = await multi.exec();
        if (execResult) {
          // Transaction was successful
          return game;
        } else {
          // Transaction failed due to concurrent modification, retry
          retries++;
          continue;
        }
      } catch (error) {
        console.error(`Error making move in game ${gameId}:`, error);
        throw error;
      } finally {
        await this.client.unwatch();
      }
    }
    throw new Error('Failed to make move due to concurrent updates. Please try again.');
  }

  /**
   * Retrieves the game state for the provided gameId.
   */
  async getGame(gameId: string): Promise<Game | null> {
    const key = this.getGameKey(gameId);
    const gameData = await this.client.get(key);
    return gameData ? (JSON.parse(gameData) as Game) : null;
  }

  /**
   * Retrieves a list of all active game IDs.
   */
  async getAllGames(): Promise<string[]> {
    const keys = await this.client.keys('game:*');
    return keys.map((key) => key.split(':')[1]);
  }

  /**
   * Deletes the game data for the provided gameId.
   */
  async cleanup(gameId: string): Promise<void> {
    const key = this.getGameKey(gameId);
    await this.client.del(key);
  }

  /**
   * Resets a game to its initial state without changing the gameId or players.
   */
  async resetGame(gameId: string): Promise<Game | null> {
    const key = this.getGameKey(gameId);
    const gameData = await this.client.get(key);
    if (gameData) {
      const game: Game = JSON.parse(gameData);
      game.board = Array(9).fill(null);
      game.currentPlayer = 0;
      game.history = [Array(9).fill(null)];
      await this.setGame(gameId, game);
      return game;
    }
    return null;
  }
}
