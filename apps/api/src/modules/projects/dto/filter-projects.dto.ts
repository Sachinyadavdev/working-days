import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class FilterProjectsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'ARCHIVED'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({ description: 'Filter by project manager employee ID' })
  @IsOptional()
  @IsString()
  projectManagerId?: string;

  @ApiPropertyOptional({ description: 'Filter projects with deadline before this date' })
  @IsOptional()
  @IsDateString()
  deadlineBefore?: string;

  @ApiPropertyOptional({ description: 'Filter projects with deadline after this date' })
  @IsOptional()
  @IsDateString()
  deadlineAfter?: string;
}
