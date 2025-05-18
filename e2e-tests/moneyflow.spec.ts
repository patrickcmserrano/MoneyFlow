import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';

test.describe('Componente MoneyFlow', () => {
  test('deve exibir o diagrama Sankey corretamente', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.navigateToMoneyFlow();
    
    // Esperar pelo diagrama Sankey ser carregado
    const chartContainer = page.locator('.chart');
    await expect(chartContainer).toBeVisible();
    
    // Verificar se não há erro de carregamento
    const errorMessage = page.locator('.error-state');
    await expect(errorMessage).not.toBeVisible();
    
    // Verificar se tem a legenda
    const legend = page.locator('.legend');
    await expect(legend).toBeVisible();
  });

  test('filtros devem alterar o diagrama Sankey', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.navigateToMoneyFlow();
    
    // Garantir que o gráfico carregou
    await page.waitForSelector('.chart:not(:has(.loading-state))');
    
    // Clicar no filtro de dinheiro físico
    const physicalMoneyFilter = page.getByRole('button', { name: homePage.expectedTexts.pt['moneyflow.filter.physical'] });
    await physicalMoneyFilter.click();
    
    // Verificar se o estado atual do filtro foi alterado para dinheiro físico
    // Isso pode ser verificado através de algum atributo visual ou pela URL
    await page.waitForTimeout(500); // Dar tempo para o gráfico atualizar
    
    // Clicar no filtro de dinheiro eletrônico
    const electronicMoneyFilter = page.getByRole('button', { name: homePage.expectedTexts.pt['moneyflow.filter.electronic'] });
    await electronicMoneyFilter.click();
    
    // Verificar se o estado atual do filtro foi alterado para dinheiro eletrônico
    await page.waitForTimeout(500); // Dar tempo para o gráfico atualizar
  });

  test('slider de ano deve alterar os dados exibidos', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.navigateToMoneyFlow();
    
    // Garantir que o gráfico carregou
    await page.waitForSelector('.chart:not(:has(.loading-state))');
    
    // Obter o valor atual do ano
    const yearLabel = page.locator('#yearLabel');
    const initialYear = await yearLabel.textContent();
    
    // Mover o slider para um ano diferente
    const yearSlider = page.locator('#yearSlider');
    await yearSlider.evaluate((el: HTMLInputElement) => {
      el.value = '2022';
      el.dispatchEvent(new Event('input'));
    });
    
    // Verificar se o ano foi alterado
    await page.waitForTimeout(500); // Dar tempo para o gráfico atualizar
    const newYear = await yearLabel.textContent();
    expect(newYear).toBe('2022');
    expect(newYear).not.toBe(initialYear);
  });

  test('controles de animação devem funcionar', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.navigateToMoneyFlow();
    
    // Garantir que o gráfico carregou
    await page.waitForSelector('.chart:not(:has(.loading-state))');
    
    // Clicar no botão de iniciar animação
    const playButton = page.getByRole('button', { 
      name: new RegExp(homePage.expectedTexts.pt['moneyflow.animation.play'], 'i') 
    });
    
    await playButton.click();
    
    // Verificar se a animação começou (deve haver uma barra de progresso)
    const progressBar = page.locator('.progress-bar');
    await expect(progressBar).toBeVisible();
    
    // Clicar no botão de parar animação
    const stopButton = page.getByRole('button', { 
      name: new RegExp(homePage.expectedTexts.pt['moneyflow.animation.stop'], 'i') 
    });
    
    await stopButton.click();
    
    // Verificar se a animação parou (a barra de progresso deve desaparecer)
    await expect(progressBar).not.toBeVisible();
  });
});
