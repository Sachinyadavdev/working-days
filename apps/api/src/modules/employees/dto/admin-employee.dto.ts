import { IsString, IsOptional, IsDateString, IsEmail, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeStatus } from '@prisma/client';

export class AdminCreateEmployeeDto {
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  
  @ApiPropertyOptional() @IsOptional() @IsString() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() designationId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() employeeType?: string;
  
  @ApiProperty() @IsDateString() dateOfJoining: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;
  
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) roles: string[];
}

export class ChangeRoleDto {
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) roles: string[];
}

export class ResetPasswordDto {
  @ApiProperty() @IsString() newPassword?: string; // If not provided, backend generates one
}

export class ChangeStatusDto {
  @ApiProperty({ enum: EmployeeStatus }) @IsEnum(EmployeeStatus) status: EmployeeStatus;
}
