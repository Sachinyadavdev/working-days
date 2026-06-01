import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AllocateBalanceItemDto {
  @ApiProperty() @IsString() employeeId: string;
  @ApiProperty() @IsString() categoryId: string;
  @ApiProperty() @IsNumber() @Min(0) allocated: number;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}

export class AllocateLeaveBalanceDto {
  @ApiProperty() @IsNumber() year: number;
  @ApiProperty({ type: [AllocateBalanceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AllocateBalanceItemDto)
  allocations: AllocateBalanceItemDto[];
}

export class AdjustLeaveBalanceDto {
  @ApiProperty() @IsNumber() allocated: number;
  @ApiPropertyOptional() @IsOptional() @IsString() remarks?: string;
}
