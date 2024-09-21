import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ConfigurationModule } from 'src/configuration/configuration.module';

@Module({
  imports: [ConfigurationModule], 
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
