import { IsIn, IsNumber, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 'fbb95f7e-1234-45ef-a6bc-1a2b3c4d5e6f' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ example: 1299.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'CARD', enum: ['CARD', 'BANK_TRANSFER', 'COD'] })
  @IsIn(['CARD', 'BANK_TRANSFER', 'COD'])
  method: 'CARD' | 'BANK_TRANSFER' | 'COD';
}
