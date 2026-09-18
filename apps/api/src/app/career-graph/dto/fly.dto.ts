import { IsNotEmpty, IsString } from 'class-validator';

export class FlyDto {
  @IsString()
  @IsNotEmpty()
  targetRoleCode!: string;
}
