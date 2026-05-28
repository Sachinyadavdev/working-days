import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignProjectDto {
  @ApiProperty({ description: 'Project ID to assign to the team' })
  @IsString()
  projectId: string;
}
