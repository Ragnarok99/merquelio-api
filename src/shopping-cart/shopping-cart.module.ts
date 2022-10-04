import { Module } from '@nestjs/common';

import { ShoppingCartService } from './shopping-cart.service';
import { ShoppingCartController } from './shopping-cart.controller';
import { ScrapperService } from '../scrapper/scrapper.service';

@Module({
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService, ScrapperService],
})
export class ShoppingCartModule {}
