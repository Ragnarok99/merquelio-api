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
    const productsNotFound = [];

    for await (const product of products) {
      const found = await searchProduct({ product, page });
      if (found) {
        productsFound.push(found);
      } else {
        productsNotFound.push(product.name);
      }
    }

    await browser.close();

    return { found: productsFound, notFound: productsNotFound };
  }

  async orderCart({ products }) {
    const { page, browser } = await createPage({
      url: 'https://domicilios.tiendasd1.com',
    });

    await signIn({ page });

    for await (const product of products) {
      await searchProduct({ product, page, addIt: true });
    }

    // go to buy page

    setTimeout(async () => {
      await browser.close();
    }, 10000);

    return true;
  }
}
