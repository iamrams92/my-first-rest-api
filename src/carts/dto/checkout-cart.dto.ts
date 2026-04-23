import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CheckoutCartDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  note?: string;
}
