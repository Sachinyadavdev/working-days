import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsEnum, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoleStatus } from '@prisma/client';

export class CreateRoleDto {
  @ApiProperty({ example: 'HR Manager', description: 'Display name of the role' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'hr-manager', description: 'Unique slug for the role' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' })
  slug: string;

  @ApiPropertyOptional({ example: 'Has access to employee records' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @ApiPropertyOptional({ example: 10, default: 0 })
  @IsInt()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({ enum: RoleStatus, default: RoleStatus.ACTIVE })
  @IsEnum(RoleStatus)
  @IsOptional()
  status?: RoleStatus;
}
