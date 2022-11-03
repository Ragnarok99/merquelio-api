import { Logger } from '@nestjs/common';
import { Page, chromium, LaunchOptions, Locator } from 'playwright';

interface Scrapable {
  page: Page;
}

interface CreatePageParams {
  options?: LaunchOptions;
  url: string;
}

interface Product {
  name: string;
  quantity: number;
}

interface SearchProductParams extends Scrapable {
  product: Product;
  addIt?: boolean;
}

export const createPage = async ({ options = {}, url }: CreatePageParams) => {
  try {
    const browser = await chromium.launch({
      headless: true,
      executablePath: process.env.CHROME_BIN,
      ...options,
    });
    const page = await browser.newPage();
    await page.goto(url);

    return { browser, page };
  } catch (error) {
    Logger.error('error opening page', { message: error.message });
  }
};

async function* iterateLocator(locator: Locator): AsyncGenerator<Locator> {
  for (let index = 0; index < (await locator.count()); index++) {
    yield locator.nth(index);
  }
}

export const searchProduct = async ({
  product,
  page,
  addIt = false,
}: SearchProductParams) => {
  try {
    await page.locator('.searchInput__container input').fill(product.name);
    await page
      .locator('.ant-btn.ant-btn-primary.ant-input-search-button')
      .click();

    let highest = Infinity;
    let lowestPriceElement: Locator = null;

    // TODO: account for empty response

    await page.waitForSelector('.card-product-vertical');

    for await (const element of iterateLocator(
      page.locator('.card-product-vertical'),
    )) {
      const elementPrice = await element.locator('.base__price').textContent();

      const price = Number(
        elementPrice.replace('$', '').replace(',', '.').trim(),
      );

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
        .locator('.prod__figure__img')
        .getAttribute('src');
      const price = await lowestPriceElement
        .locator('.base__price')
        .textContent();

      if (addIt) {
        await addProductToCart({
          currentProduct: lowestPriceElement,
          page,
          product,
        });
      }

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

const addProductToCart = async ({
  page,
  product,
  currentProduct,
}: {
  page: Page;
  currentProduct: Locator;
  product: Product;
}) => {
  await currentProduct.locator('button').click();

  await currentProduct.locator('input').fill(String(product.quantity));

  await page.waitForSelector('.loader.type-primary');
};

export const signIn = async ({ page }: Scrapable) => {
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

export const doCheckout = async ({ page }: Scrapable) => {
  await page.locator('[aria-label="View Cart"]').click();

  await page.locator('#checkoutBtn').click();

  await page.waitForSelector('.slick-slide');

  for await (const element of iterateLocator(page.locator('.slick-slide'))) {
    await element.click();

    try {
      await page.waitForSelector('.meridian-slots', { timeout: 5000 });
      await page.locator('.meridian-slots >> nth=0').click();
      break;
    } catch (errors) {
      Logger.warn('no schedule found ', errors);
    }
  }

  try {
    // TODO: this xpath sucks, find a better way
    // credit card method for payment
    await page
      .locator(
        '//html/body/div[1]/div/div[2]/div/div/div/div[2]/div/div[2]/div[2]/div/div[1]/label/div[2]',
      )
      .click();
  } catch (errors) {
    Logger.warn('no payment found ', errors);
  }

  try {
    // await page.locator('#confirmCheckout').click();
  } catch (errors) {
    Logger.warn('order failed at the end ', errors);
  }
};
