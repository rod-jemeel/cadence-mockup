import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  cadenceId!: string;

  @IsEmail()
  contactEmail!: string;
}
