import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeaveCommentDto {
  @ApiProperty() @IsString() content: string;
}
