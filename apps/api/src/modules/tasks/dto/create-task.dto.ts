import { IsString, IsOptional, IsDateString, IsInt, Min, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement user authentication' }) @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsString() projectId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() assigneeId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() parentId?: string;
  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] }) @IsOptional() @IsString() priority?: string;
  @ApiPropertyOptional({ enum: ['EPIC', 'STORY', 'TASK', 'BUG', 'SUBTASK'] }) @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) storyPoints?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() dueDate?: string;
}
