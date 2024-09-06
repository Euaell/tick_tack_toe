import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as csurf from 'csurf';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(csurf());
  app.enableCors();
  app.use(helmet());
  await app.listen(8080);
}
bootstrap();
