import { Logger } from '@nestjs/common';
import { Page, chromium, LaunchOptions } from 'playwright';

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

export const searchProduct = async ({ product, page }: SearchProductParams) => {
  try {
    await page.locator('.searchInput__container input').fill(product.name);
    await page
      .locator('.ant-btn.ant-btn-primary.ant-input-search-button')
      .click();

    const currentPageProducts = page.locator(
      '//span[@data-testid[contains(.,"product-card")]]',
    );

    const count = await currentPageProducts.count();
    for (let i = 0; i < count; ++i) {
      const t = await currentPageProducts
        .nth(i)
        .locator('p', {
          has: currentPageProducts
            .nth(i)
            .locator('.prod--default__price__current'),
        })
        .textContent();

      return t;
    }
    return {};
  } catch (error) {
    Logger.warn(`product ${product.name} not found`, {
      message: error.message,
    });
    return;
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
