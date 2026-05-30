import { IsString, IsOptional, IsDateString, IsEmail, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeStatus } from '@prisma/client';
import { PartialType } from '@nestjs/swagger';

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
  @ApiPropertyOptional() @IsOptional() @IsString() employeeCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() emergencyContact?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() workLocation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bloodGroup?: string;
  
  @ApiProperty() @IsDateString() dateOfJoining: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dateOfBirth?: string;
  @ApiPropertyOptional() @IsOptional() requiredDailyHours?: number;
  
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) roles: string[];
}

export class AdminUpdateEmployeeDto extends PartialType(AdminCreateEmployeeDto) {}

export class ChangeRoleDto {
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) roles: string[];
}

export class ResetPasswordDto {
  @ApiProperty() @IsString() newPassword?: string; // If not provided, backend generates one
}

export class ChangeStatusDto {
  @ApiProperty({ enum: EmployeeStatus }) @IsEnum(EmployeeStatus) status: EmployeeStatus;
}
