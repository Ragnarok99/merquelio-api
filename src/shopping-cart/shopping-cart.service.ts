import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 } from 'uuid';

import { ScrapperService } from '../scrapper/scrapper.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShoppingCartDto } from './dto/create-shopping-cart.dto';
import { UpdateShoppingCartDto } from './dto/update-shopping-cart.dto';
import { Product } from './types';

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
    const products = createShoppingCartDto?.products?.map(
      (product: Product) => ({
        ...product,
        id: v4(),
      }),
    );
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
    const productsFound = await this.scrapperService.searchProducts({
      products: cart.products,
    });

    return productsFound;
  }

  async findAll() {
    const products = await this.prisma.shoppingCart.findMany();
    return products;
  }

  async findOne(id: string) {
    const cart = await this.prisma.shoppingCart.findUnique({ where: { id } });

    return cart;
  }

  async update(id: string, updateShoppingCartDto: UpdateShoppingCartDto) {
    const currentCart = await this.prisma.shoppingCart.findUnique({
      where: { id },
    });
    if (!currentCart) {
      throw new NotFoundException('Cart not found');
    }

    const products = updateShoppingCartDto?.products?.map(
      (product: Product) => {
        if (product?.id) {
          return product;
        }

        return { ...product, id: v4() };
      },
    );

    return await this.prisma.shoppingCart.updateMany({
      where: { id },
      data: {
        ...updateShoppingCartDto,
        products: products as Partial<UpdateShoppingCartDto>,
      },
    });
  }

  remove(id: string) {
    return `This action removes a #${id} shoppingCart`;
  }
}
