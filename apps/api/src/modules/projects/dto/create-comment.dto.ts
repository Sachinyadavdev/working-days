import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'This is a comment on the project.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
