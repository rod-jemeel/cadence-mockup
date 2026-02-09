import { IsString, IsOptional, IsArray } from 'class-validator';
import type { CadenceStep } from '@repo/shared';

export class UpdateCadenceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsOptional()
  steps?: CadenceStep[];
}
