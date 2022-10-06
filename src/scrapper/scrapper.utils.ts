import { Logger } from '@nestjs/common';
import { Page, chromium, LaunchOptions, Locator } from 'playwright';

interface SignInParams {
  page: Page;
}

interface CreatePageParams {
  options?: LaunchOptions;
  url: string;
}

interface Product {
  name: string;
}

interface SearchProductParams {
  product: Product;
  page: Page;
}

export const createPage = async ({ options = {}, url }: CreatePageParams) => {
  try {
    const browser = await chromium.launch({ headless: false, ...options });
    const page = await browser.newPage();
    await page.goto(url);

    return { browser, page };
  } catch (error) {
    Logger.error('error opennig page', { message: error.message });
  }
};

async function* iterateLocator(locator: Locator): AsyncGenerator<Locator> {
  for (let index = 0; index < (await locator.count()); index++) {
    yield locator.nth(index);
  }
}

export const searchProduct = async ({ product, page }: SearchProductParams) => {
  try {
    await page.locator('.searchInput__container input').fill(product.name);
    await page
      .locator('.ant-btn.ant-btn-primary.ant-input-search-button')
      .click();

    let highest = Infinity;
    let lowestPriceElement: Locator = null;

    await page.waitForSelector('.card-product-vertical');

    for await (const element of iterateLocator(
      page.locator('.card-product-vertical'),
    )) {
      const elementPrice = await element
        .locator('.prod--default__price__current')
        .textContent();

      const price = Number(elementPrice.split(' ')[1]);
      console.log({ price, highest });
      if (price < highest) {
        highest = price;
        lowestPriceElement = element;
      }
    }

    if (lowestPriceElement) {
      const name = await lowestPriceElement
        .locator('.prod__name')
        .textContent();
      const image = await lowestPriceElement
        .locator('.prod__image__img')
        .getAttribute('src');
      const price = await lowestPriceElement
        .locator('.prod--default__price__current')
        .textContent();

      return {
        name,
        image,
        price,
      };
    }

    return null;
  } catch (error) {
    Logger.warn(`product ${product.name} not found`, {
      message: error.message,
    });
  }
};

export const signIn = async ({ page }: SignInParams) => {
  try {
    await page.locator('.user__account').click();
    await page
      .locator('button', {
        has: page.locator('p', { hasText: 'Inicio Sesión' }),
      })
      .click();

    await page.locator('#signup_email').fill(process.env.USERNAME);
    await page.locator('#signup_password').fill(process.env.USER_PASSWORD);

    await page
      .locator('button', {
        has: page.locator('span', { hasText: 'Iniciar Sesión' }),
      })
      .click();

    await page.waitForSelector('text="Inicio sesion exitosa"');
  } catch (error) {
    Logger.error('error siging in ', { message: error.message });
  }
};
