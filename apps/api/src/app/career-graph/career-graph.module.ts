import { Module } from '@nestjs/common';
import { CareerGraphController } from './career-graph.controller';
import { CareerGraphService } from './career-graph.service';
import { roleGraphProvider } from './role-graph.provider';

@Module({
  controllers: [CareerGraphController],
  providers: [roleGraphProvider, CareerGraphService],
})
export class CareerGraphModule {}
