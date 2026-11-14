import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseFilters,
} from '@nestjs/common';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProblemFilter, ZodProblemPipe } from '../core/problem';
import { AppFeedbackService } from './app-feedback.service';
import {
  RatingInputSchema,
  SendAppFeedbackSchema,
  type RatingInput,
  type SendAppFeedbackInput,
} from './feedback.dto';
import { RatingService } from './rating.service';

/**
 * CL-03 `RatingController`, openapi `getRatingForm`, `rateOccupation`.
 * `occupationId` tạm nhận cả mã nghề (07 A26).
 */
@Controller('v1/occupations/:occupationId/ratings')
@UseFilters(ProblemFilter)
@Roles('EXPLORER')
export class RatingController {
  constructor(private readonly ratings: RatingService) {}

  @Get('form')
  getRatingForm(
    @CurrentUser() user: AuthUser,
    @Param('occupationId') occupationId: string,
  ) {
    return this.ratings.form(user.id, occupationId);
  }

  @Post()
  rateOccupation(
    @CurrentUser() user: AuthUser,
    @Param('occupationId') occupationId: string,
    @Body(new ZodProblemPipe(RatingInputSchema)) dto: RatingInput,
  ) {
    return this.ratings.rate(user.id, occupationId, dto);
  }
}

/** CL-03 `AppFeedbackController`, openapi `sendAppFeedback`. */
@Controller('v1/app-feedback')
@UseFilters(ProblemFilter)
@Roles('EXPLORER', 'DOMAIN_EXPERT', 'CONTENT_ADMIN')
export class AppFeedbackController {
  constructor(private readonly feedback: AppFeedbackService) {}

  @Post()
  @HttpCode(201)
  async sendAppFeedback(
    @CurrentUser() user: AuthUser,
    @Body(new ZodProblemPipe(SendAppFeedbackSchema)) dto: SendAppFeedbackInput,
  ): Promise<void> {
    await this.feedback.send(user.id, dto);
  }
}
