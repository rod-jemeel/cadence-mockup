import { IsArray, ArrayMinSize } from 'class-validator';
import type { CadenceStep } from '@repo/shared';

export class UpdateCadenceStepsDto {
  @IsArray()
  @ArrayMinSize(1)
  steps!: CadenceStep[];
}
