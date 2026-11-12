import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { OccupationAccessGuard } from '../auth/guards/occupation-access.guard';
import { ProblemFilter, ZodProblemPipe } from '../core/problem';
import {
  CreateReviewCriteriaVersionSchema,
  type CreateReviewCriteriaVersionInput,
} from './catalogue.dto';
import { CatalogueService } from './catalogue.service';
import { ReviewCriteriaService } from './review-criteria.service';

/** CL-02 `OccupationController` + `ProfileController` (phần đọc) + `ReviewCriteriaController`. */
@Controller('v1/staff/occupations')
@UseFilters(ProblemFilter)
@UseGuards(OccupationAccessGuard)
@Roles('CONTENT_ADMIN', 'DOMAIN_EXPERT')
export class CatalogueController {
  constructor(
    private readonly catalogue: CatalogueService,
    private readonly criteria: ReviewCriteriaService,
  ) {}

  @Get()
  listMyOccupations(@CurrentUser() user: AuthUser) {
    return this.catalogue.listMyOccupations(user.id);
  }

  @Get(':occupationId/profile')
  getOccupationProfileForEdit(
    @Param('occupationId', ParseUUIDPipe) occupationId: string,
  ) {
    return this.catalogue.getProfileForEdit(occupationId);
  }

  @Get(':occupationId/review-criteria')
  getReviewCriteria(
    @Param('occupationId', ParseUUIDPipe) occupationId: string,
  ) {
    return this.criteria.get(occupationId);
  }

  @Post(':occupationId/review-criteria')
  @Roles('CONTENT_ADMIN')
  createReviewCriteriaVersion(
    @CurrentUser() user: AuthUser,
    @Param('occupationId', ParseUUIDPipe) occupationId: string,
    @Body(new ZodProblemPipe(CreateReviewCriteriaVersionSchema))
    dto: CreateReviewCriteriaVersionInput,
  ) {
    return this.criteria.createVersion(occupationId, user.id, dto);
  }
}
