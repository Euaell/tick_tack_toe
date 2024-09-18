import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    console.log('New client connected:', client.id);
  }

  async handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    const allGames = await this.gameService.getAllGames();
    for (const gameId of allGames) {
      const game = await this.gameService.getGame(gameId);
      if (game.players.includes(client.id)) {
        game.players = game.players.filter(p => p !== client.id);
        if (game.players.length === 0) {
          await this.gameService.cleanup(gameId);
        } else {
          await this.gameService.updateGame(gameId, game);
          this.server.to(gameId).emit('playerLeft', { gameId });
        }
      }
    }
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(client: Socket, gameId: string) {
    const game = await this.gameService.joinGame(gameId, client.id);
    client.join(gameId);
    console.log(`Client ${client.id} joined game ${gameId}`);
    this.server.to(gameId).emit('gameUpdate', game);
  }

  @SubscribeMessage('makeMove')
  async handleMakeMove(client: Socket, payload: { gameId: string, index: number }) {
    const { gameId, index } = payload;
    const game = await this.gameService.makeMove(gameId, client.id, index);
    if (game) {
      this.server.to(gameId).emit('gameUpdate', game);
    }
  }

  @SubscribeMessage('requestRestart')
  async handleRequestRestart(client: Socket, payload: { gameId: string }) {
    const { gameId } = payload;
    // Notify other players in the game
    client.to(gameId).emit('restartRequest');
  }

  @SubscribeMessage('confirmRestart')
  async handleConfirmRestart(client: Socket, payload: { gameId: string, accept: boolean }) {
    const { gameId, accept } = payload;
    if (accept) {
      // Reset the game state
      const game = await this.gameService.resetGame(gameId);
      if (game) {
        this.server.to(gameId).emit('gameUpdate', game);
        this.server.to(gameId).emit('restartConfirmed', { accept: true });
      }
    } else {
      client.to(gameId).emit('restartConfirmed', { accept: false });
    }
  }
}
