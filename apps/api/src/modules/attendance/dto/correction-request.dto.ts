import { IsEnum, IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CorrectionType } from '@ems/shared-types';

export class CorrectionRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  attendanceId: string;

  @ApiProperty({ enum: CorrectionType })
  @IsEnum(CorrectionType)
  @IsNotEmpty()
  type: CorrectionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  requestedCheckIn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  requestedCheckOut?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;
}
