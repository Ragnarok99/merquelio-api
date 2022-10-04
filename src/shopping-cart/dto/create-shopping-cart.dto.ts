import { IsNotEmpty, IsString } from 'class-validator';

import { Product } from '../types';

export class CreateShoppingCartDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  products?: [];
}
