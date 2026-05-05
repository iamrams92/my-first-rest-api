import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertCartItemDto {
  @ApiProperty({ example: '34c8f36f-1234-49f5-9ddd-ff11aa22bb33' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
