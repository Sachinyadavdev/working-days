import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddMemberDto {
  @ApiProperty({ description: 'Employee ID to add to the project' })
  @IsString()
  employeeId: string;

  @ApiPropertyOptional({ enum: ['MANAGER', 'LEAD', 'MEMBER'], default: 'MEMBER' })
  @IsOptional()
  @IsString()
  role?: string;
}
