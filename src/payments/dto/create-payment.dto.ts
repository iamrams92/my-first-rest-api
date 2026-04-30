import { IsIn, IsNumber, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @IsUUID()
  orderId: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount: number;

  @IsIn(['CARD', 'BANK_TRANSFER', 'COD'])
  method: 'CARD' | 'BANK_TRANSFER' | 'COD';
}
