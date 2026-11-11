/**
 * API ca làm (Game Design W45) dưới `/api/v1/shift-runs`, song song với
 * `/api/v1/runs` của luồng activity. Lỗi dạng Problem (RFC 9457).
 * Đường dẫn và hình dạng là ĐỀ XUẤT ngoài `openapi.yaml`:
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
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ProblemFilter } from '../core/problem';
import {
  NoteSchema,
  ShiftFlagSchema,
  StartShiftSchema,
  TurnSchema,
  type StartShiftDto,
  type TurnDto,
} from './shift.dto';
import { ShiftRunService } from './shift-run.service';

@Controller('v1/shift-runs')
@UseFilters(ProblemFilter)
export class ShiftRunController {
  constructor(private readonly runs: ShiftRunService) {}

  /** 201 lượt mới, 200 lượt đang dở của cùng nhiệm vụ (NFR-03). */
  @Post()
  async start(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(StartShiftSchema)) dto: StartShiftDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { created, run } = await this.runs.start(user.id, dto);
    res.status(created ? 201 : 200);
    return run;
  }

  /** Ca làm của một cấp. Khai trước `:runId` để route này không bị nuốt. */
  @Get('tasks')
  tasks(@Query('roleCode') roleCode = '', @Query('band') band = '') {
    return this.runs.tasks(roleCode, band);
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
    @Body(new ZodValidationPipe(TurnSchema)) dto: TurnDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.runs.submitTurn(user.id, runId, dto);
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
    @Body(new ZodValidationPipe(NoteSchema)) dto: { text: string },
  ) {
    return this.runs.addNote(user.id, runId, dto.text);
  }

  @Post(':runId/flags')
  @HttpCode(201)
  async flag(
    @CurrentUser() user: AuthUser,
    @Param('runId') runId: string,
    @Body(new ZodValidationPipe(ShiftFlagSchema))
    dto: { activityKey: string; reason: string },
  ) {
    await this.runs.flag(user.id, runId, dto);
  }

  @Get(':runId/summary')
  summary(@CurrentUser() user: AuthUser, @Param('runId') runId: string) {
    return this.runs.summary(user.id, runId);
  }
}
