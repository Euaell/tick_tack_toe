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
    const allGames = this.gameService.getAllGames();
    Object.keys(allGames).forEach(gameId => {
      const game = allGames[gameId];
      if (game.players.includes(client.id)) {
        game.players = game.players.filter(p => p !== client.id);
        if (game.players.length === 0) {
          this.gameService.cleanup(gameId);
        } else {
          this.server.to(gameId).emit('playerLeft', { gameId });
        }
      }
    });
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(client: Socket, gameId: string) {
    const game = this.gameService.joinGame(gameId, client.id);
    client.join(gameId);
    console.log(`Client ${client.id} joined game ${gameId}`);
    this.server.to(gameId).emit('gameUpdate', game);
  }

  @SubscribeMessage('makeMove')
  handleMakeMove(client: Socket, { gameId, index }: { gameId: string, index: number }) {
    const game = this.gameService.makeMove(gameId, client.id, index);
    if (game) {
      this.server.to(gameId).emit('gameUpdate', game);
    }
  }
}
