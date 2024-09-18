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
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(client: Socket, gameId: string) {
    client.join(gameId);
    console.log(`Client ${client.id} joined chat for game ${gameId}`);
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    client: Socket,
    { gameId, message }: { gameId: string; message: string },
  ) {
    const chatMessage = { sender: client.id, message };
    this.chatService.addMessage(gameId, chatMessage);
    this.server.to(gameId).emit('receiveMessage', chatMessage);
  }

  @SubscribeMessage('getMessages')
  handleGetMessages(client: Socket, gameId: string) {
    const messages = this.chatService.getMessages(gameId);
    client.emit('receiveMessages', messages);
  }
}
