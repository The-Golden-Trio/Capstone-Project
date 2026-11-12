import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { z } from 'zod';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { OccupationAccessGuard } from '../auth/guards/occupation-access.guard';
import { ProblemFilter, ZodProblemPipe } from '../core/problem';
import { AssetService, MAX_ASSET_BYTES } from './asset.service';
import { BuildService } from './build.service';
import { PresentationService } from './presentation.service';
import {
  ASSET_KINDS,
  PresentationSchema,
  UploadAssetSchema,
  type PresentationInput,
} from './publishing.dto';

/** CL-06 `PresentationController` (C06). Gợi ý trình bày bằng AI hoãn theo D-104. */
@Controller('v1/staff/scenarios/:scenarioId')
@UseFilters(ProblemFilter)
@UseGuards(OccupationAccessGuard)
export class PresentationController {
  constructor(
    private readonly presentation: PresentationService,
    private readonly builds: BuildService,
  ) {}

  @Get('presentation')
  @Roles('CONTENT_ADMIN', 'DOMAIN_EXPERT')
  getPresentation(@Param('scenarioId', ParseUUIDPipe) scenarioId: string) {
    return this.presentation.get(scenarioId);
  }

  @Put('presentation')
  @Roles('CONTENT_ADMIN')
  savePresentation(
    @CurrentUser() user: AuthUser,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
    @Body(new ZodProblemPipe(PresentationSchema)) dto: PresentationInput,
  ) {
    return this.presentation.save(user, scenarioId, dto);
  }

  /** CL-06 `BuildController.buildDraftGame`: APPROVED → IN_PLAYTEST. */
  @Post('builds')
  @Roles('CONTENT_ADMIN')
  buildDraftGame(
    @CurrentUser() user: AuthUser,
    @Param('scenarioId', ParseUUIDPipe) scenarioId: string,
  ) {
    return this.builds.build(user, scenarioId);
  }
}

/** CL-06 `BuildController.getBuild`. */
@Controller('v1/staff/builds')
@UseFilters(ProblemFilter)
@UseGuards(OccupationAccessGuard)
@Roles('CONTENT_ADMIN', 'DOMAIN_EXPERT')
export class BuildController {
  constructor(private readonly builds: BuildService) {}

  @Get(':buildId')
  getBuild(@Param('buildId', ParseUUIDPipe) buildId: string) {
    return this.builds.get(buildId);
  }
}

/** CL-06 `AssetController` (C07). Sinh asset bằng AI hoãn theo D-104. */
@Controller('v1/staff/assets')
@UseFilters(ProblemFilter)
@Roles('CONTENT_ADMIN')
export class AssetController {
  constructor(private readonly assets: AssetService) {}

  @Get()
  listAssets(
    @Query(
      new ZodProblemPipe(z.object({ kind: z.enum(ASSET_KINDS).optional() })),
    )
    query: {
      kind?: (typeof ASSET_KINDS)[number];
    },
  ) {
    return this.assets.list(query.kind);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_ASSET_BYTES + 1 } }),
  )
  uploadAsset(
    @CurrentUser() user: AuthUser,
    @Body(new ZodProblemPipe(UploadAssetSchema))
    body: z.infer<typeof UploadAssetSchema>,
    @UploadedFile()
    file: { buffer: Buffer; mimetype: string; size: number } | undefined,
  ) {
    return this.assets.upload(user.id, body, file);
  }
}
