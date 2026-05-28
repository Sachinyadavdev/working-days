import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '@ems/shared-types';

export class CheckInDto {
  @ApiPropertyOptional({ enum: AttendanceStatus })
  @IsOptional() @IsEnum(AttendanceStatus) status?: AttendanceStatus;

  @ApiPropertyOptional()
  @IsOptional() @IsString() notes?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() ipAddress?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() deviceInfo?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() location?: string;
}
