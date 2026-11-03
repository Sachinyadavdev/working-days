import { IsOptional, IsString, MaxLength } from 'class-validator';

// Employment, reporting, salary and identity fields are administrator-managed.
export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(50)
  phone?: string;

  @IsOptional() @IsString() @MaxLength(1000)
  address?: string;

  @IsOptional() @IsString() @MaxLength(500)
  emergencyContact?: string;
}
