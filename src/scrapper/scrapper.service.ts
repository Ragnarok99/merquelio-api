import { Injectable } from '@nestjs/common';

import { createPage, signIn } from './scrapper.utils';

@Injectable()
export class ScrapperService {
  async test() {
    const { page, browser } = await createPage({
      url: 'https://domicilios.tiendasd1.com',
    });

    await signIn({ page });

    setTimeout(async () => {
      await browser.close();
    }, 35000);
  }
}
