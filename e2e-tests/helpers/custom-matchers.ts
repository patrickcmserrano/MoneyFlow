import { expect, Locator } from '@playwright/test';

// Esses testes faltam em Playwright, então adicionamos aqui
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace PlaywrightTest {
    interface Matchers<R> {
      toBeInViewport(): R;
    }
  }
}

/**
 * Verifica se um elemento está dentro da viewport atual
 */
export async function toBeInViewport(this: any, locator: Locator) {
  const isInViewport = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });

  // Pre-evaluate the HTML outside of the message function
  const elementHtml = await locator.evaluate((el) => el.outerHTML);

  return {
    pass: isInViewport,
    message: () =>
      `expected element ${this.utils.printReceived(
        elementHtml
      )} ${isInViewport ? 'not ' : ''}to be in viewport`,
  };
}

/**
 * Adiciona os matchers personalizados ao Playwright
 */
export function setupCustomMatchers() {
  expect.extend({ toBeInViewport });
}
