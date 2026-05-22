import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CheckInDto {
  @ApiPropertyOptional({ enum: ['PRESENT', 'LATE', 'WORK_FROM_HOME'] })
  @IsOptional() @IsString() status?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() notes?: string;
}
