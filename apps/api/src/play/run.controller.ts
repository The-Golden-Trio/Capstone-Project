/**
 * Nhóm Play của `reports/master/api/openapi.yaml` (CL-03 `RunController`),
 * dưới `/api/v1`. Lỗi trả theo RFC 9457 (`Problem`).
 *
 * Phiên đăng nhập: cookie httpOnly như phần còn lại của app (Bearer cũng được
 * nhận). Hợp đồng ghi Bearer; §5.3.1 còn ghi cookie — chỗ lệch đã có ghi chú.
 */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
  UseFilters,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ProblemFilter } from '../core/problem';
import {
  AnswerSchema,
  FlagSchema,
  HintSchema,
  StartRunSchema,
  type AnswerDto,
  type FlagDto,
  type HintDto,
  type StartRunDto,
} from './play.dto';
import { RunService } from './run.service';
import { SummaryService } from './summary.service';

@Controller('v1')
@UseFilters(ProblemFilter)
export class RunController {
  constructor(
    private readonly runs: RunService,
    private readonly summaries: SummaryService,
  ) {}

  @Post('runs')
  async startRun(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(StartRunSchema)) dto: StartRunDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { status, body } = await this.runs.start(user, dto);
    res.status(status);
    return body;
  }

  @Get('runs/:runId')
  getRun(@CurrentUser() user: AuthUser, @Param('runId') runId: string) {
    return this.runs.get(user, runId);
  }

  @Get('runs/:runId/activity')
  getCurrentActivity(
    @CurrentUser() user: AuthUser,
    @Param('runId') runId: string,
  ) {
    return this.runs.currentActivity(user, runId);
  }

  @Post('runs/:runId/answers')
  async submitAnswer(
    @CurrentUser() user: AuthUser,
    @Param('runId') runId: string,
    @Body(new ZodValidationPipe(AnswerSchema)) dto: AnswerDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { status, body } = await this.runs.submitAnswer(user, runId, dto);
    res.status(status);
    return body;
  }

  @Post('runs/:runId/hints')
  @HttpCode(200)
  viewHint(
    @CurrentUser() user: AuthUser,
    @Param('runId') runId: string,
    @Body(new ZodValidationPipe(HintSchema)) dto: HintDto,
  ) {
    return this.runs.viewHint(user, runId, dto);
  }

  @Post('runs/:runId/flags')
  @HttpCode(204)
  async flagContent(
    @CurrentUser() user: AuthUser,
    @Param('runId') runId: string,
    @Body(new ZodValidationPipe(FlagSchema)) dto: FlagDto,
  ): Promise<void> {
    await this.runs.flag(user, runId, dto);
  }

  @Post('runs/:runId/finish')
  async finishRun(
    @CurrentUser() user: AuthUser,
    @Param('runId') runId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { status, body } = await this.summaries.finish(user, runId);
    res.status(status);
    return body;
  }

  @Get('runs/:runId/summary')
  getRunSummary(@CurrentUser() user: AuthUser, @Param('runId') runId: string) {
    return this.summaries.get(user, runId);
  }

  /**
   * Tệp phát hành của kịch bản theo `Run.releaseVersion`. Ngoài hợp đồng: thiết
   * kế đặt tệp này trên CDN (§5.3.1, SD-08 chưa làm); khi chạy local thì API
   * phục vụ thay. Cùng nội dung `/api/content/scenarios/:key` vốn đã mở.
   */
  @Get('releases/:version')
  release(@Param('version') version: string) {
    return this.runs.release(version);
  }
}
