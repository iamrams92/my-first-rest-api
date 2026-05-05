import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({ example: '73d1b5a1-1234-4f68-a9e3-00aab1d2c3d4' })
  @IsUUID()
  userId: string;
}
