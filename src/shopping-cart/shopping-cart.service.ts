import { Injectable, NotFoundException } from '@nestjs/common';
import { ScrapperService } from 'src/scrapper/scrapper.service';
import { PrismaService } from '../prisma/prisma.service';

import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import { UpdateShoppingCartDto } from './dto/update-shopping-cart.dto';

@Injectable()
export class ShoppingCartService {
  /**
   *
   */
  constructor(
    private readonly prisma: PrismaService,
    private readonly scrapperService: ScrapperService,
  ) {}
  async create(createShoppingCartDto: CreateShoppingCartDto) {
    const products = createShoppingCartDto?.products;
    const cart = await this.prisma.shoppingCart.create({
      data: {
        ...createShoppingCartDto,
        products,
      },
    });
    return cart;
  }

  async search(id: string) {
    const cart = await this.prisma.shoppingCart.findUnique({
      where: { id },
    });

    if (!cart) {
      throw new NotFoundException('cart not found');
    }
    const test = await this.scrapperService.searchProducts({
      products: cart.products,
    });
    return { test };
  }

  async findAll() {
    const products = await this.prisma.shoppingCart.findMany();
    return products;
  }

  findOne(id: string) {
    return `This action returns a #${id} shoppingCart`;
  }

  async update(id: string, updateShoppingCartDto: UpdateShoppingCartDto) {
    const currentCart = await this.prisma.shoppingCart.findUnique({
      where: { id },
    });
    if (!currentCart) {
      throw new NotFoundException('Cart not found');
    }

    return await this.prisma.shoppingCart.updateMany({
      where: { id },
      data: {
        ...updateShoppingCartDto,
        products: [...updateShoppingCartDto.products, ...currentCart?.products],
      },
    });
  }

  remove(id: string) {
    return `This action removes a #${id} shoppingCart`;
  }
}
