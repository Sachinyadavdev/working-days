import { IsString, IsDateString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeaveRequestDto {
  @ApiProperty({ description: 'Leave category ID' }) @IsString() categoryId: string;
  @ApiProperty() @IsDateString() startDate: string;
  @ApiProperty() @IsDateString() endDate: string;
  @ApiProperty() @IsNumber() @Min(0.5) totalDays: number;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() halfDay?: boolean;
  @ApiPropertyOptional({ enum: ['FIRST_HALF', 'SECOND_HALF'] }) @IsOptional() @IsString() halfDayPeriod?: string;
  @ApiProperty() @IsString() reason: string;
  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() emergencyLeave?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() attachmentUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactDuringLeave?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() backupEmployeeId?: string;
}
