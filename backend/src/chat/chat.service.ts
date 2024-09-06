import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  private chats: Record<string, string[]> = {};

  addMessage(gameId: string, message: string) {
    if (!this.chats[gameId]) {
      this.chats[gameId] = [];
    }
    this.chats[gameId].push(message);
  }

  getMessages(gameId: string) {
    return this.chats[gameId] || [];
  }
}
