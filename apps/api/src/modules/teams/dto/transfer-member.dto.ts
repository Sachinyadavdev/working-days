import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransferMemberDto {
  @ApiProperty({ description: 'Target team ID to transfer the employee to' })
  @IsString()
  toTeamId: string;

  @ApiProperty({ description: 'Employee ID to transfer' })
  @IsString()
  employeeId: string;
}
