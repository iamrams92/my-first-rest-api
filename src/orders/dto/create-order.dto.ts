import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

class CreateOrderItemInputDto {
  @ApiProperty({ example: '34c8f36f-1234-49f5-9ddd-ff11aa22bb33' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: '73d1b5a1-1234-4f68-a9e3-00aab1d2c3d4' })
  @IsUUID()
  userId: string;

  @ApiProperty({
    type: [CreateOrderItemInputDto],
    example: [{ productId: '34c8f36f-1234-49f5-9ddd-ff11aa22bb33', quantity: 2 }],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemInputDto)
  items: CreateOrderItemInputDto[];
}
