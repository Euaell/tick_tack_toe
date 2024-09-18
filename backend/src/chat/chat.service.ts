import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  private chats: Record<string, any[]> = {};

  addMessage(gameId: string, message: any) {
    if (!this.chats[gameId]) {
      this.chats[gameId] = [];
    }
    this.chats[gameId].push(message);
  }

  getMessages(gameId: string) {
    return this.chats[gameId] || [];
  }
}
