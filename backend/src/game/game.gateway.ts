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

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    Object.keys(this.gameService.getGame(client.id)).forEach(gameId => {
      const game = this.gameService.getGame(gameId);
      game.players = game.players.filter(p => p !== client.id);
      if (game.players.length === 0) {
        this.gameService.cleanup(gameId);
      } else {
        this.server.to(gameId).emit('playerLeft', { gameId });
      }
    });
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(client: Socket, gameId: string) {
    client.join(gameId);
    if (!this.gameService.getGame(gameId)) {
      this.gameService.createGame(gameId, client.id);
    } else {
      const game = this.gameService.joinGame(gameId, client.id);
      this.server.to(gameId).emit('gameStart', game);
    }
  }

  @SubscribeMessage('makeMove')
  handleMakeMove(client: Socket, { gameId, index }: { gameId: string, index: number }) {
    const game = this.gameService.makeMove(gameId, client.id, index);
    this.server.to(gameId).emit('updateGame', game);
    // Check for win or draw logic should be added here
  }

  @SubscribeMessage('cleanup')
  handleCleanup(client: Socket, gameId: string) {
    this.gameService.cleanup(gameId);
    client.leave(gameId);
  }
}
