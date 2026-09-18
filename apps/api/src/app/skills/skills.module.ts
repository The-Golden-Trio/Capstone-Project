import { Module } from '@nestjs/common';
import { SkillProgressController, SkillsController } from './skills.controller';
import { SkillsService } from './skills.service';

@Module({
  controllers: [SkillProgressController, SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
