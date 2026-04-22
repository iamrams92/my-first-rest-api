import { Type } from 'class-transformer';
import { IsIn, IsInt, Min } from 'class-validator';

export class CreateOrderDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;

  @IsIn(['BUY', 'SELL'])
  transactionType: 'BUY' | 'SELL';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
