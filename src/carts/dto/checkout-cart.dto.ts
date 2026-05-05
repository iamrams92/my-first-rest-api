import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutCartDto {
  @ApiPropertyOptional({ example: 'Please deliver before 6 PM.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  note?: string;
}
