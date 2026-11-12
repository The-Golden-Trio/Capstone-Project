import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { z } from 'zod';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { OccupationAccessGuard } from '../auth/guards/occupation-access.guard';
import { ProblemFilter, ZodProblemPipe } from '../core/problem';
import { ContentService } from './content.service';
import {
  AssignmentSchema,
  GenerationInputSchema,
  OpenScenarioSchema,
  ReferenceAnswerInputSchema,
  RequestRevisionSchema,
  ScenarioContentSchema,
  type AssignmentInput,
  type GenerationInput,
  type ReferenceAnswerInput,
  type RequestRevisionInput,
  type ScenarioContent,
} from './dto/scenario-content.schema';
import { GenerationService } from './generation.service';
import { ScenarioService, type ScenarioDetail } from './scenario.service';

const ListQuerySchema = z.object({
  occupationId: z.uuid().optional(),
  status: z
    .enum([
      'DRAFT',
      'SUBMITTED',
      'IN_REVIEW',
      'APPROVED',
      'IN_PLAYTEST',
      'READY',
      'PUBLISHED',
      'RETIRED',
    ])
    .optional(),
  mine: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const withEtag = (res: Response, detail: ScenarioDetail): ScenarioDetail => {
  res.setHeader('ETag', `"${detail.version}"`);
  return detail;
};

/** CL-05 `ScenarioController` + `ContentController` + `GenerationController` (SD-05). */
@Controller('v1/staff/scenarios')
@UseFilters(ProblemFilter)
@UseGuards(OccupationAccessGuard)
@Roles('CONTENT_ADMIN', 'DOMAIN_EXPERT')
export class ScenarioController {
  constructor(
    private readonly scenarios: ScenarioService,
    private readonly content: ContentService,
    private readonly generation: GenerationService,
  ) {}

  @Get()
  listScenarios(
    @CurrentUser() user: AuthUser,
    @Query(new ZodProblemPipe(ListQuerySchema))
    query: z.infer<typeof ListQuerySchema>,
  ) {
    return this.scenarios.list(user, query);
  }

  @Post()
  @Roles('CONTENT_ADMIN')
  async openScenario(
    @CurrentUser() user: AuthUser,
    @Body(new ZodProblemPipe(OpenScenarioSchema)) dto: { taskId: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return withEtag(res, await this.scenarios.open(user, dto.taskId));
  }

  @Get(':scenarioId')
  async getScenario(
    @CurrentUser() user: AuthUser,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return withEtag(res, await this.scenarios.detail(user, scenarioId));
  }

  @Put(':scenarioId/assignment')
  @Roles('CONTENT_ADMIN')
  assignScenarioStaff(
    @CurrentUser() user: AuthUser,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Body(new ZodProblemPipe(AssignmentSchema)) dto: AssignmentInput,
  ) {
    return this.scenarios.assign(user, scenarioId, dto);
  }

  @Get(':scenarioId/history')
  getScenarioHistory(@Param('scenarioId', ParseUUIDPipe) scenarioId: string) {
    return this.scenarios.history(scenarioId);
  }

  @Post(':scenarioId/submit')
  @HttpCode(200)
  @Roles('DOMAIN_EXPERT')
  submitScenario(
    @CurrentUser() user: AuthUser,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
  ) {
    return this.scenarios.submit(user, scenarioId);
  }

  /* ── Nội dung ─────────────────────────────────────────────────── */

  @Put(':scenarioId/content')
  @Roles('DOMAIN_EXPERT')
  async saveScenarioContent(
    @CurrentUser() user: AuthUser,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Headers('if-match') ifMatch: string | undefined,
    @Body(new ZodProblemPipe(ScenarioContentSchema)) dto: ScenarioContent,
    @Res({ passthrough: true }) res: Response,
  ) {
    return withEtag(
      res,
      await this.content.save(user, scenarioId, ifMatch, dto),
    );
  }

  @Post(':scenarioId/checks')
  @HttpCode(200)
  @Roles('DOMAIN_EXPERT')
  runContentChecks(@Param('scenarioId', ParseUUIDPipe) scenarioId: string) {
    return this.content.checks(scenarioId);
  }

  @Get(':scenarioId/reference-answers')
  @Roles('DOMAIN_EXPERT')
  listReferenceAnswers(@Param('scenarioId', ParseUUIDPipe) scenarioId: string) {
    return this.content.referenceAnswers(scenarioId);
  }

  @Post(':scenarioId/reference-answers')
  @Roles('DOMAIN_EXPERT')
  addReferenceAnswer(
    @CurrentUser() user: AuthUser,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Body(new ZodProblemPipe(ReferenceAnswerInputSchema))
    dto: ReferenceAnswerInput,
  ) {
    return this.content.addReferenceAnswer(user, scenarioId, dto);
  }

  /* ── Sinh bằng AI ─────────────────────────────────────────────── */

  @Get(':scenarioId/situation-options')
  @Roles('DOMAIN_EXPERT')
  getSituationOptions(@Param('scenarioId', ParseUUIDPipe) scenarioId: string) {
    return this.generation.situationOptions(scenarioId);
  }

  @Get(':scenarioId/generations')
  listGenerations(@Param('scenarioId', ParseUUIDPipe) scenarioId: string) {
    return this.generation.list(scenarioId);
  }

  @Post(':scenarioId/generations')
  @HttpCode(202)
  @Roles('DOMAIN_EXPERT')
  requestGeneration(
    @CurrentUser() user: AuthUser,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Body(new ZodProblemPipe(GenerationInputSchema)) dto: GenerationInput,
  ) {
    return this.generation.requestGeneration(user, scenarioId, dto);
  }

  @Post(':scenarioId/revisions')
  @HttpCode(202)
  @Roles('DOMAIN_EXPERT')
  requestRevision(
    @CurrentUser() user: AuthUser,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Body(new ZodProblemPipe(RequestRevisionSchema)) dto: RequestRevisionInput,
  ) {
    return this.generation.requestRevision(user, scenarioId, dto);
  }
}
