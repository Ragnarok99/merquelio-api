import { Logger } from '@nestjs/common';
import { Page, chromium, LaunchOptions } from 'playwright';

interface SignInParams {
  page: Page;
}

interface CreatePageParams {
  options?: LaunchOptions;
  url: string;
}

export const createPage = async ({ options = {}, url }: CreatePageParams) => {
  try {
    const browser = await chromium.launch({ headless: false, ...options });
    const page = await browser.newPage();
    await page.goto(url);

    return { browser, page };
  } catch (errors) {
    Logger.error('error logging in ', { errors });
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

    // TODO: add env vars or login
    await page.locator('#signup_email').fill('test@hotmail.com');
    await page.locator('#signup_password').fill('mypassword94939->.');

    await page
      .locator('button', {
        has: page.locator('span', { hasText: 'Iniciar Sesión' }),
      })
      .click();
  } catch (errors) {
    Logger.error('error siging in ', { errors });
  }
};
