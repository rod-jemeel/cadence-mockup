import type { CadenceStep } from '@repo/shared';

export class UpdateCadenceDto {
  name?: string;
  steps?: CadenceStep[];
}
