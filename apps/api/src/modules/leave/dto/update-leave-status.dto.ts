import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLeaveStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] }) @IsString() @IsIn(['APPROVED', 'REJECTED']) status: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reviewNote?: string;
}
