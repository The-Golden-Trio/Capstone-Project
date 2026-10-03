import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

/**
 * 1 phần tử của `evidence_emitted[]` — ĐÚNG shape spec-scenario-KHOI1 mục B3 (snake_case)
 * để runtime AI có thể pass thẳng, không phải map lại.
 * Spec 2.1 đã đổi `beats[]` → `activities[]` nên khoá là `activity_id`; `beat_id` được nhận
 * như alias legacy.
 */
export class EvidenceItemDto {
  @IsOptional()
  @IsString()
  activity_id?: string;

  /** Alias legacy (spec < 2.1). Chỉ dùng khi thiếu activity_id. */
  @IsOptional()
  @IsString()
  beat_id?: string;

  /** Đúng chuỗi trong observes[].skill — server resolve qua taxonomy alias. */
  @IsString()
  @IsNotEmpty()
  skill!: string;

  @IsIn(['+2', '0', '-1'])
  anchor_hit!: '+2' | '0' | '-1';

  /** Trích đúng chữ người chơi; chỉ được null khi timeout=true (A11). */
  @IsOptional()
  @IsString()
  quote?: string | null;

  @IsOptional()
  @IsBoolean()
  hint_used?: boolean;

  @IsOptional()
  @IsBoolean()
  timeout?: boolean;
}

export class IngestEvidenceDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsString()
  @IsNotEmpty()
  scenarioId!: string;

  @IsString()
  @IsNotEmpty()
  roleCode!: string;

  @IsString()
  @IsNotEmpty()
  band!: string;

  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => EvidenceItemDto)
  evidence!: EvidenceItemDto[];
}
