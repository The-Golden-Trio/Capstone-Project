import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import {
  ProgressService,
  type ProgressSummary,
  type RoleProgress,
} from '../progress/progress.service';
import { RunsService } from '../runs/runs.service';
import { ProfileService, type GameProfileView } from './profile.service';
import {
  AnswerEventSchema,
  EnrollSchema,
  ImportLegacySchema,
  SubmitQuizSchema,
  type AnswerEventDto,
  type EnrollDto,
  type ImportLegacyDto,
  type SubmitQuizDto,
} from './dto/profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profile: ProfileService,
    private readonly progress: ProgressService,
    private readonly runs: RunsService,
  ) {}

  /** Chân dung, mốc đã qua, sự kiện đã chơi. */
  @Get()
  get(@CurrentUser() user: AuthUser): Promise<GameProfileView> {
    return this.profile.get(user.id);
  }

  /** Điểm kỹ năng, cấp bậc đã mở, điểm theo kỹ năng, đường tiến bộ. */
  @Get('progress')
  progressSummary(@CurrentUser() user: AuthUser): Promise<ProgressSummary> {
    return this.progress.summary(user.id);
  }

  /** Lộ trình cấp bậc của một nghề — dùng cho màn roadmap. */
  @Get('roles/:roleCode')
  async roleProgress(
    @CurrentUser() user: AuthUser,
    @Param('roleCode') roleCode: string,
  ): Promise<RoleProgress> {
    const progress = await this.progress.roleProgress(user.id, roleCode);
    if (!progress) throw new NotFoundException('Không có nghề này');
    return progress;
  }

  /** Ghi danh một cấp bậc trước khi làm kịch bản của nó. */
  @HttpCode(200)
  @Post('roles/:roleCode/enroll')
  async enroll(
    @CurrentUser() user: AuthUser,
    @Param('roleCode') roleCode: string,
    @Body(new ZodValidationPipe(EnrollSchema)) dto: EnrollDto,
  ): Promise<RoleProgress> {
    await this.progress.enroll(user.id, roleCode, dto.band);
    const progress = await this.progress.roleProgress(user.id, roleCode);
    if (!progress) throw new NotFoundException('Không có nghề này');
    return progress;
  }

  /** Lịch sử các lượt chơi đã hoàn thành, kèm bằng chứng máy chủ đã chấm. */
  @Get('runs')
  history(@CurrentUser() user: AuthUser) {
    return this.runs.history(user.id);
  }

  @HttpCode(200)
  @Post('quiz')
  submitQuiz(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(SubmitQuizSchema)) dto: SubmitQuizDto,
  ): Promise<GameProfileView> {
    return this.profile.submitQuiz(user.id, dto.answers);
  }

  @HttpCode(200)
  @Post('events/:eventId')
  answerEvent(
    @CurrentUser() user: AuthUser,
    @Param('eventId') eventId: string,
    @Body(new ZodValidationPipe(AnswerEventSchema)) dto: AnswerEventDto,
  ) {
    return this.profile.answerEvent(
      user.id,
      dto.roleCode,
      dto.band,
      eventId,
      dto.choiceIndex,
    );
  }

  /** Nhập bản lưu cũ trong localStorage — chân dung thôi, không có điểm kỹ năng. */
  @HttpCode(200)
  @Post('import')
  importLegacy(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(ImportLegacySchema)) dto: ImportLegacyDto,
  ): Promise<GameProfileView> {
    return this.profile.importLegacy(user.id, dto);
  }
}
