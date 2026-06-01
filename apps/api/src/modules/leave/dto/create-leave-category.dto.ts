import { IsString, IsOptional, IsInt, IsBoolean, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeaveCategoryDto {
  @ApiProperty({ example: 'Casual Leave' }) @IsString() @MaxLength(100) name: string;
  @ApiProperty({ example: 'CL' }) @IsString() @MaxLength(10) code: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ example: 12 }) @IsInt() @Min(0) totalDaysPerYear: number;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() carryForwardAllowed?: boolean;
  @ApiPropertyOptional({ default: 0 }) @IsOptional() @IsInt() @Min(0) maxCarryForward?: number;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() requiresApproval?: boolean;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() requiresDocument?: boolean;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isPaid?: boolean;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}
