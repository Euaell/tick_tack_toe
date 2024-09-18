import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { ConfigurationModule } from 'src/configuration/configuration.module';
import { GameController } from './game.controller';

@Module({
  imports: [ConfigurationModule],
  providers: [GameGateway, GameService],
  controllers: [GameController],
})
export class GameModule {}
