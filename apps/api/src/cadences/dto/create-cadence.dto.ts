import type { CadenceStep } from '@repo/shared';

export class CreateCadenceDto {
  name!: string;
  steps!: CadenceStep[];
}
