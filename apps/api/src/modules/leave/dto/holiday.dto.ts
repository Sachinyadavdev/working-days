import { IsString, IsDateString, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHolidayDto {
  @ApiProperty({ example: 'Independence Day' }) @IsString() name: string;
  @ApiProperty({ example: '2026-08-15' }) @IsDateString() date: string;
  @ApiProperty({ enum: ['PUBLIC', 'COMPANY', 'REGIONAL'], default: 'COMPANY' })
  @IsString()
  @IsIn(['PUBLIC', 'COMPANY', 'REGIONAL'])
  type: string;
  @ApiPropertyOptional() @IsOptional() @IsString() region?: string;
  @ApiPropertyOptional({ default: true }) @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateHolidayDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() date?: string;
  @ApiPropertyOptional({ enum: ['PUBLIC', 'COMPANY', 'REGIONAL'] }) @IsOptional() @IsString() @IsIn(['PUBLIC', 'COMPANY', 'REGIONAL']) type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() region?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
