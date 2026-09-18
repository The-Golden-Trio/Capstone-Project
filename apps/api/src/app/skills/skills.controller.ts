import { Body, Controller, Get, Post } from '@nestjs/common';
import { DEV_USER } from '../config/progression.config';
import { IngestEvidenceDto } from './dto/ingest-evidence.dto';
import { SkillsService } from './skills.service';

@Controller('skill-progress')
export class SkillProgressController {
  constructor(private readonly service: SkillsService) {}

  /** POST /api/skill-progress/ingest — nhận evidence_emitted[] (shape B3). */
  @Post('ingest')
  ingest(@Body() dto: IngestEvidenceDto) {
    return this.service.ingest(dto);
  }

  /** GET /api/skill-progress/me — tiến độ của dev user (chưa có auth thật). */
  @Get('me')
  me() {
    return this.service.getProgress(DEV_USER.userId);
  }
}

@Controller('skills')
export class SkillsController {
  constructor(private readonly service: SkillsService) {}

  /** GET /api/skills — toàn bộ taxonomy (dev harness dùng để chọn skill). */
  @Get()
  list() {
    return this.service.listSkills();
  }
}
