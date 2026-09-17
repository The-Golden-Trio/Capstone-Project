import { Module } from '@nestjs/common';
import { ProgressService } from '../progress/progress.service';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';

@Module({
  controllers: [RunsController],
  providers: [RunsService, ProgressService],
  exports: [RunsService, ProgressService],
})
export class RunsModule {}
