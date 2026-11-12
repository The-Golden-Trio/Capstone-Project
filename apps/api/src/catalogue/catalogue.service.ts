import { Injectable } from '@nestjs/common';
import { Problem } from '../core/problem';
import { PrismaService } from '../prisma/prisma.service';
import type { ProfileEdit, StaffOccupation } from './catalogue.dto';

/**
 * CL-02 `CatalogueModule`, phần cần cho soạn scenario: nghề tôi được giao và
 * hồ sơ nghề (chỉ đọc). Tạo/sửa nghề và hồ sơ (C02, D02) thuộc P1.
 */
@Injectable()
export class CatalogueService {
  constructor(private readonly prisma: PrismaService) {}

  async listMyOccupations(userId: string): Promise<StaffOccupation[]> {
    const rows = await this.prisma.staffAssignment.findMany({
      where: { userId, endedAt: null },
      include: { occupation: true },
      orderBy: [{ occupation: { name: 'asc' } }, { role: 'asc' }],
    });
    return rows.map((r) => ({
      id: r.occupation.id,
      domainId: r.occupation.domainId,
      code: r.occupation.code,
      name: r.occupation.name,
      status: r.occupation.status,
      myRole: r.role,
    }));
  }

  async getProfileForEdit(occupationId: string): Promise<ProfileEdit> {
    const occupation = await this.prisma.occupation.findUnique({
      where: { id: occupationId },
      include: {
        levels: {
          orderBy: { levelNo: 'asc' },
          include: {
            tasks: { orderBy: { sortOrder: 'asc' } },
            competencies: true,
          },
        },
        downsides: { orderBy: { sortOrder: 'asc' } },
        generationRules: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!occupation) throw new Problem(404, 'NOT_FOUND', 'Không tìm thấy nghề');
    return {
      levels: occupation.levels.map((l) => ({
        levelNo: l.levelNo,
        band: l.band,
        creditThreshold: l.creditThreshold,
        ...(l.salaryMin !== null ? { salaryMin: Number(l.salaryMin) } : {}),
        ...(l.salaryMax !== null ? { salaryMax: Number(l.salaryMax) } : {}),
        title: l.title,
        ...(l.futureRole ? { futureRole: l.futureRole } : {}),
        competencies: l.competencies.map((c) => ({
          competencyId: c.competencyId,
          proficiency: c.proficiency,
        })),
        tasks: l.tasks.map((t) => ({ taskId: t.id, text: t.text })),
      })),
      downsides: occupation.downsides.map((d) => d.text),
      generationRules: occupation.generationRules.map((r) => r.ruleText),
      // `occupation_adjacency` thuộc P1 (AdjacencyService), chưa dựng.
      adjacency: [],
    };
  }
}
