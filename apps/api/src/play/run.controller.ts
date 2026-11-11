/**
 * CL-03 RunController cho ca làm, dưới `/api/v1/runs`. Lỗi dạng Problem
 * (RFC 9457). Đường dẫn và hình dạng là ĐỀ XUẤT, ngoài `openapi.yaml`:
 * xem `docs/plans/2026-11-11_de-xuat-api-choi-ca-lam.md`.
 */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseFilters,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import { ProblemFilter, ZodProblemPipe } from '../common/problem';
import {
  FlagSchema,
  HintSchema,
  NoteSchema,
  StartRunSchema,
  TurnSchema,
  type StartRunDto,
  type TurnDto,
} from './dto/play.dto';
import { RunService } from './run.service';

@Controller('v1/runs')
@UseFilters(ProblemFilter)
export class RunController {
  constructor(private readonly runs: RunService) {}

  /** 201 lượt mới, 200 lượt đang dở của cùng nhiệm vụ (NFR-03). */
  @Post()
  async start(
    @CurrentUser() user: AuthUser,
    @Body(new ZodProblemPipe(StartRunSchema)) dto: StartRunDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { created, run } = await this.runs.start(user.id, dto);
    res.status(created ? 201 : 200);
    return run;
  }

  @Get(':runId')
  get(@CurrentUser() user: AuthUser, @Param('runId') runId: string) {
    return this.runs.get(user.id, runId);
  }

  @Get(':runId/scene')
  scene(@CurrentUser() user: AuthUser, @Param('runId') runId: string) {
    return this.runs.scene(user.id, runId);
  }

  @Get(':runId/transcript')
  transcript(
    @CurrentUser() user: AuthUser,
    @Param('runId') runId: string,
    @Query('after', new ParseIntPipe({ optional: true })) after?: number,
  ) {
    return this.runs.transcript(user.id, runId, after);
  }

  /** 200 lượt xong ngay; 202 lượt cần AI, kết quả về `/api/v1/stream`. */
  @Post(':runId/turns')
  async turn(
    @CurrentUser() user: AuthUser,
    @Param('runId') runId: string,
    @Body(new ZodProblemPipe(TurnSchema)) dto: TurnDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.runs.submitTurn(user.id, runId, dto);
    res.status(result.status);
    return result.body;
  }

  @Post(':runId/hints')
  async hint(
    @CurrentUser() user: AuthUser,
    @Param('runId') runId: string,
    @Body(new ZodProblemPipe(HintSchema)) dto: { turnId: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.runs.hint(user.id, runId, dto.turnId);
    res.status(result.status);
    return result.body;
  }

  @Post(':runId/resume')
  @HttpCode(202)
  resume(@CurrentUser() user: AuthUser, @Param('runId') runId: string) {
    return this.runs.resume(user.id, runId);
  }

  @Post(':runId/notes')
  @HttpCode(201)
  note(
    @CurrentUser() user: AuthUser,
    @Param('runId') runId: string,
    @Body(new ZodProblemPipe(NoteSchema)) dto: { text: string },
  ) {
    return this.runs.addNote(user.id, runId, dto.text);
  }

  @Post(':runId/flags')
  @HttpCode(201)
  async flag(
    @CurrentUser() user: AuthUser,
    @Param('runId') runId: string,
    @Body(new ZodProblemPipe(FlagSchema))
    dto: { activityKey: string; reason: string },
  ) {
    await this.runs.flag(user.id, runId, dto);
  }

  @Get(':runId/summary')
  summary(@CurrentUser() user: AuthUser, @Param('runId') runId: string) {
    return this.runs.summary(user.id, runId);
  }
}
