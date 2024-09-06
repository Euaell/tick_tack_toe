import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class FileGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('shareFile')
  handleShareFile(
    client: Socket,
    { gameId, file }: { gameId: string; file: any },
  ) {
    console.log(`Received file from ${client.id}`);
    // Emit the file to all users in the game room besides the sender
    client.to(gameId).emit('fileShared', { file });
  }
}
