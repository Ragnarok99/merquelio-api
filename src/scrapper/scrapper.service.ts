import { Injectable } from '@nestjs/common';

import { createPage, searchProduct, signIn } from './scrapper.utils';

@Injectable()
export class ScrapperService {
  async searchProducts({ products }) {
    const { page, browser } = await createPage({
      url: 'https://domicilios.tiendasd1.com',
    });

    await signIn({ page });

    const productsFound = [];

    for await (const product of products) {
      const found = await searchProduct({ product, page });
      if (found) {
        productsFound.push(found);
      }
    }

    await browser.close();

    return productsFound;
  }
}
