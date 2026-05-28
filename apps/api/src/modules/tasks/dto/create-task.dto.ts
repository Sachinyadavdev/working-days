import { IsString, IsOptional, IsDateString, IsInt, Min, IsEnum, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ChecklistItemDto {
  @IsString() id: string;
  @IsString() title: string;
  @IsBoolean() completed: boolean;
  @IsOptional() @IsString() completedAt?: string | null;
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement user authentication' }) @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: ['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'COMPLETED', 'BLOCKED', 'CANCELLED', 'DRAFT'] }) @IsOptional() @IsString() status?: string;
  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] }) @IsOptional() @IsString() priority?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() deadline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assignedTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) estimatedHours?: number;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() tags?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() attachments?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() projectId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() parentId?: string;
  
  @ApiPropertyOptional({ type: [ChecklistItemDto] }) 
  @IsOptional() 
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemDto)
  checklist?: ChecklistItemDto[];
}
