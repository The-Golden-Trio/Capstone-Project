import { Body, Controller, Get, Post } from '@nestjs/common';
import { DEV_USER } from '../config/progression.config';
import { CareerGraphService } from './career-graph.service';
import { FlyDto } from './dto/fly.dto';

@Controller('career-graph')
export class CareerGraphController {
  constructor(private readonly service: CareerGraphService) {}

  /** GET /api/career-graph — nodes + edges + vị trí + unlock cho cạnh kề current. */
  @Get()
  get() {
    return this.service.getView(DEV_USER.userId);
  }

  /** POST /api/career-graph/fly — server tự kiểm unlock(), chỉ ghi UserGraphPosition. */
  @Post('fly')
  fly(@Body() dto: FlyDto) {
    return this.service.fly(DEV_USER.userId, dto.targetRoleCode);
  }
}
