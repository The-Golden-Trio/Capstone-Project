import {
  Controller,
  Get,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import {
  CurrentUser,
  type AuthUser,
} from '../auth/decorators/current-user.decorator';
import { loadSessionUser, toMe, type Me } from '../auth/me';
import { ProblemFilter } from '../core/problem';
import { PrismaService } from '../prisma/prisma.service';

/** CL-01 `MeController`. Phần cập nhật, xoá, hồ sơ riêng làm sau (ngoài phạm vi staff). */
@Controller('v1/me')
@UseFilters(ProblemFilter)
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getMe(@CurrentUser() user: AuthUser): Promise<Me> {
    const found = await loadSessionUser(this.prisma, user.id);
    if (!found) throw new UnauthorizedException();
    return toMe(found);
  }
}
