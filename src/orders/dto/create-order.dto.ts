import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  productId: string;

  @IsIn(['BUY', 'SELL'])
  transactionType: 'BUY' | 'SELL';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsUUID()
  customerId?: string;
}
