import { Controller, Get, Query, UseFilters } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import { ProblemFilter } from '../core/problem';
import { NotificationService } from './notification.service';

/** CL-07 `NotificationController`, openapi `listNotifications`. */
@Controller('v1/staff/notifications')
@UseFilters(ProblemFilter)
@Roles('DOMAIN_EXPERT', 'CONTENT_ADMIN', 'SYSTEM_ADMIN')
export class NotificationController {
  constructor(private readonly notifications: NotificationService) {}

  @Get()
  async listNotifications(
    @CurrentUser() user: AuthUser,
    @Query('limit') limit?: string,
  ) {
    return {
      items: await this.notifications.list(user.id, Number(limit) || 30),
      nextCursor: null,
    };
  }
}
