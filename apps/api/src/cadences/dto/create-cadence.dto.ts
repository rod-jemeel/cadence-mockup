import { IsString, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';
import type { CadenceStep } from '@repo/shared';

export class CreateCadenceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  steps!: CadenceStep[];
}
