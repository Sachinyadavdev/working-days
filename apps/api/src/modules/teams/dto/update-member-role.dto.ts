import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['TEAM_LEAD', 'SENIOR_DEVELOPER', 'DEVELOPER', 'QA_ENGINEER', 'UI_UX_DESIGNER', 'DEVOPS_ENGINEER', 'INTERN', 'MEMBER'] })
  @IsString()
  role: string;
}
