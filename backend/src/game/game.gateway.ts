import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log('New client connected:', client.id);
  }

  async handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    const gameId = client.data.gameId;

    if (gameId) {
      try {
        const game = await this.gameService.getGame(gameId);
        if (game && game.players.includes(client.id)) {
          game.players = game.players.filter((p) => p !== client.id);
          if (game.players.length === 0) {
            await this.gameService.cleanup(gameId);
          } else {
            await this.gameService.setGame(gameId, game);
            this.server.to(gameId).emit('playerLeft', { gameId, playerId: client.id });
          }
        }
      } catch (error) {
        console.error(`Error handling disconnect for client ${client.id}:`, error);
      }
    }
  }

  @SubscribeMessage('joinGame')
async handleJoinGame(client: Socket, gameId: string) {
  try {
    const game = await this.gameService.joinGame(gameId, client.id);
    client.join(gameId);
    client.data.gameId = gameId;
    console.log(`Client ${client.id} joined game ${gameId}`);

    // Emit 'playerJoined' event to other players in the game
    client.to(gameId).emit('playerJoined', { gameId, playerId: client.id });

    // Send the updated game state to all players in the game
    this.server.to(gameId).emit('gameUpdate', game);

    // **Emit the assigned symbol back to the client**
    const playerSymbol = game.playerSymbols[client.id];
    client.emit('assignedSymbol', { symbol: playerSymbol });
  } catch (error) {
    console.error(`Error handling joinGame for client ${client.id}:`, error);
    client.emit('error', { message: 'Failed to join game.' });
  }
}

  @SubscribeMessage('makeMove')
  async handleMakeMove(client: Socket, payload: { gameId: string; index: number }) {
    const { gameId, index } = payload;
    try {
      const game = await this.gameService.makeMove(gameId, client.id, index);
      if (game) {
        this.server.to(gameId).emit('gameUpdate', game);
      } else {
        client.emit('error', { message: 'Invalid move or not your turn.' });
      }
    } catch (error) {
      console.error(`Error handling makeMove for client ${client.id}:`, error);
      client.emit('error', { message: 'Failed to make move.' });
    }
  }

  @SubscribeMessage('requestRestart')
  async handleRequestRestart(client: Socket, payload: { gameId: string }) {
    const { gameId } = payload;
    // Notify other players in the game
    client.to(gameId).emit('restartRequest', { playerId: client.id });
  }

  @SubscribeMessage('confirmRestart')
  async handleConfirmRestart(
    client: Socket,
    payload: { gameId: string; accept: boolean },
  ) {
    const { gameId, accept } = payload;
    try {
      if (accept) {
        // Reset the game state
        const game = await this.gameService.resetGame(gameId);
        if (game) {
          this.server.to(gameId).emit('gameUpdate', game);
          this.server.to(gameId).emit('restartConfirmed', { accept: true });
        } else {
          client.emit('error', { message: 'Failed to reset game.' });
        }
      } else {
        client.to(gameId).emit('restartConfirmed', { accept: false, playerId: client.id });
      }
    } catch (error) {
      console.error(`Error handling confirmRestart for client ${client.id}:`, error);
      client.emit('error', { message: 'Failed to process restart confirmation.' });
    }
  }
}
