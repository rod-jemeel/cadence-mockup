import { IsArray } from 'class-validator';
import type { CadenceStep } from '@repo/shared';

export class UpdateCadenceStepsDto {
  @IsArray()
  steps!: CadenceStep[];
}
