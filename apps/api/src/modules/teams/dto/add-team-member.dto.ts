import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddTeamMemberDto {
  @ApiProperty({ example: 'uuid-of-employee' })
  @IsString()
  employeeId: string;

  @ApiPropertyOptional({ enum: ['TEAM_LEAD', 'SENIOR_DEVELOPER', 'DEVELOPER', 'QA_ENGINEER', 'UI_UX_DESIGNER', 'DEVOPS_ENGINEER', 'INTERN', 'MEMBER'] })
  @IsOptional()
  @IsString()
  role?: string;
}
