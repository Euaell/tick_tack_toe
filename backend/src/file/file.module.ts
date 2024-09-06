import { Module } from '@nestjs/common';
import { FileGateway } from './file.gateway';

@Module({
  providers: [FileGateway],
})
export class FileModule {}