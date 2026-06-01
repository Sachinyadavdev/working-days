import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLeaveStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED', 'CANCELLED'] })
  @IsString()
  @IsIn(['APPROVED', 'REJECTED', 'CANCELLED'])
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewNote?: string;

  @ApiPropertyOptional({ description: 'Reason for cancellation' })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
