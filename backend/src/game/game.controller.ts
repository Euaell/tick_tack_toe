import { Controller, Post } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  async createGame() {
    const game = await this.gameService.createGame();
    return { gameId: game.gameId };
  }
}
