import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BreakType } from '@ems/shared-types';

export class StartBreakDto {
  @ApiProperty({ enum: BreakType })
  @IsEnum(BreakType)
  @IsNotEmpty()
  type: BreakType;
}
