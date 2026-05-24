import { IsString, IsOptional, IsDateString, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement user authentication' }) @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: ['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'COMPLETED', 'BLOCKED', 'CANCELLED'] }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] }) @IsOptional() @IsString() priority?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() deadline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) estimatedHours?: number;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() tags?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() attachments?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() projectId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() parentId?: string;
}
