import { Body, Controller, Param, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import {
  CompleteRunSchema,
  StartRunSchema,
  type CompleteRunDto,
  type StartRunDto,
} from './dto/run.dto';
import { RunsService, type CompletedRun, type StartedRun } from './runs.service';

@Controller('runs')
export class RunsController {
  constructor(private readonly runs: RunsService) {}

  /** Mở màn chơi: kiểm cấp bậc đã mở chưa, rồi phát hạt giống. */
  @Post()
  start(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(StartRunSchema)) dto: StartRunDto,
  ): Promise<StartedRun> {
    return this.runs.start(user.id, dto.scenarioKey);
  }

  /** Nộp chuỗi hành động để máy chủ chạy lại và chấm. */
  @Post(':id/complete')
  complete(
    @CurrentUser() user: AuthUser,
    @Param('id') runId: string,
    @Body(new ZodValidationPipe(CompleteRunSchema)) dto: CompleteRunDto,
  ): Promise<CompletedRun> {
    return this.runs.complete(user.id, runId, dto);
  }
}
