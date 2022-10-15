import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import { UpdateShoppingCartDto } from './dto/update-shopping-cart.dto';

@Controller('shopping-carts')
export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  @Post()
  create(@Body() createShoppingCartDto: CreateShoppingCartDto) {
    return this.shoppingCartService.create(createShoppingCartDto);
  }

  @Post(':id/order')
  orderCart(@Param('id') id: string) {
    return this.shoppingCartService.orderCart(id);
  }

  @Get(':id/search')
  search(@Param('id') id: string) {
    return this.shoppingCartService.search(id);
  }

  @Get()
  findAll() {
    return this.shoppingCartService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shoppingCartService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShoppingCartDto: UpdateShoppingCartDto,
  ) {
    return this.shoppingCartService.update(id, updateShoppingCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shoppingCartService.remove(id);
  }
}
