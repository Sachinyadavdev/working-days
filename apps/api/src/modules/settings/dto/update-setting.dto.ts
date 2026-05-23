import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiProperty({ description: 'The value for the setting (can be any JSON structure)' })
  @IsNotEmpty()
  value: any;

  @ApiProperty({ description: 'Optional description of what this setting does', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Whether the setting is public (exposed to unauthenticated users)', required: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}
