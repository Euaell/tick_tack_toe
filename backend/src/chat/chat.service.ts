import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigurationService } from 'src/configuration/configuration.service';

@Injectable()
export class ChatService {
  private client: RedisClientType;

  constructor(private readonly configService: ConfigurationService) {
    this.client = createClient({
      url: this.configService.get('REDIS_URL'),
    });
    this.client.connect().catch((err) => console.error('Redis Client Error', err));
  }

  /**
   * Adds a message to the chat list for the specified game.
   * If the chat list doesn't exist, it will be created automatically by Redis.
   * Trims the list to keep only the latest 100 messages.
   */
  async addMessage(gameId: string, message: any): Promise<void> {
    const key = `chat:${gameId}`;
    await this.client.rPush(key, JSON.stringify(message));
    await this.client.lTrim(key, -100, -1); // Keep only the last 100 messages
    // Optionally, set an expiration time for the chat
    // await this.client.expire(key, 60 * 60 * 24); // Expires in 24 hours
  }

  /**
   * Retrieves all messages for the specified game chat.
   * Returns an array of messages, or an empty array if no messages are found.
   */
  async getMessages(gameId: string): Promise<any[]> {
    const key = `chat:${gameId}`;
    const messages = await this.client.lRange(key, 0, -1);
    return messages.map((msg) => JSON.parse(msg));
  }
}
