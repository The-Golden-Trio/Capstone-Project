import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { OccupationAccessGuard } from '../auth/guards/occupation-access.guard';
import type { Env } from '../config/env';
import { ProblemFilter, ZodProblemPipe } from '../core/problem';
import { ScenarioViewService } from '../lifecycle/scenario-view.service';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { AssignmentService } from './assignment.service';
import {
  ListAssignmentsQuerySchema,
  ReassignReviewSchema,
  ReviewDecisionSchema,
  type ReassignReviewInput,
  type ReviewDecisionInput,
} from './review.dto';
import { ReviewService } from './review.service';

/** CL-05 `ReviewController` (SD-06). */
@Controller('v1/staff')
@UseFilters(ProblemFilter)
@UseGuards(OccupationAccessGuard)
@Roles('DOMAIN_EXPERT')
export class ReviewController {
  constructor(private readonly reviews: ReviewService) {}

  @Get('reviews')
  listMyReviewQueue(@CurrentUser() user: AuthUser) {
    return this.reviews.queue(user);
  }

  @Get('scenarios/:scenarioId/review')
  openScenarioForReview(
    @CurrentUser() user: AuthUser,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
  ) {
    return this.reviews.open(user, scenarioId);
  }

  @Post('scenarios/:scenarioId/review')
  @HttpCode(200)
  decideReview(
    @CurrentUser() user: AuthUser,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Body(new ZodProblemPipe(ReviewDecisionSchema)) dto: ReviewDecisionInput,
  ) {
    return this.reviews.decide(user, scenarioId, dto);
  }
}

/** CL-05 `ReviewAssignmentController` (AD-02f, FR-34). */
@Controller('v1/staff/review-assignments')
@UseFilters(ProblemFilter)
@UseGuards(OccupationAccessGuard)
@Roles('CONTENT_ADMIN')
export class ReviewAssignmentController {
  constructor(
    private readonly assignments: AssignmentService,
    private readonly view: ScenarioViewService,
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Get()
  listReviewAssignments(
    @CurrentUser() user: AuthUser,
    @Query(new ZodProblemPipe(ListAssignmentsQuerySchema))
    query: z.infer<typeof ListAssignmentsQuerySchema>,
  ) {
    return this.assignments.list(user.id, query);
  }

  @Post(':assignmentId/reassign')
  async reassignReview(
    @CurrentUser() user: AuthUser,
    @Param('assignmentId', ParseUUIDPipe) assignmentId: string,
    @Body(new ZodProblemPipe(ReassignReviewSchema)) dto: ReassignReviewInput,
  ) {
    const current = await this.prisma.reviewAssignment.findUniqueOrThrow({
      where: { id: assignmentId },
      select: { scenarioId: true },
    });
    const row = await this.view.load(current.scenarioId);
    const experts = new Set(
      (await this.view.expertsOf(row.task.level.occupationId)).map(
        (e) => e.userId,
      ),
    );
    const id = await this.assignments.reassign(
      assignmentId,
      {
        reviewerId: dto.reviewerId,
        deadlineAt: new Date(dto.deadlineAt),
        assignedBy: user.id,
      },
      experts,
    );
    await this.notifications.notify(dto.reviewerId, 'REVIEW_ASSIGNED', {
      scenarioId: row.id,
      taskText: row.task.text,
      occupationName: row.task.level.occupation.name,
      deadlineAt: dto.deadlineAt,
      link: `${this.config.get('STAFF_ORIGIN', { infer: true })}/staff/de`,
    });
    return this.assignments.view(id);
  }
}
