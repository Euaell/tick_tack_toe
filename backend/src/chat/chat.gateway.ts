import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    client: Socket,
    { gameId, message }: { gameId: string; message: string },
  ) {
    this.chatService.addMessage(gameId, message);
    this.server.to(gameId).emit('receiveMessage', { id: client.id, message });
  }

  @SubscribeMessage('getMessages')
  handleGetMessages(client: Socket, gameId: string) {
    const messages = this.chatService.getMessages(gameId);
    client.emit('receiveMessages', messages);
  }
}
