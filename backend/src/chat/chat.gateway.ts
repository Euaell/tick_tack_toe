import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    // Handle client disconnect logic if needed
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    client: Socket,
    { gameId, message }: { gameId: string; message: string },
  ) {
    this.chatService.addMessage(gameId, { sender: client.id, message });
    this.server.to(gameId).emit('receiveMessage', {
      sender: client.id,
      message,
    });
  }

  @SubscribeMessage('getMessages')
  handleGetMessages(client: Socket, gameId: string) {
    const messages = this.chatService.getMessages(gameId);
    client.emit('receiveMessages', messages);
  }

  @SubscribeMessage('shareFile')
  handleShareFile(
    client: Socket,
    { gameId, file }: { gameId: string; file: any },
  ) {
    console.log(`Received file from ${client.id}`);
    this.chatService.addMessage(gameId, { sender: client.id, file });
    this.server.to(gameId).emit('fileShared', { sender: client.id, file });
  }
}
