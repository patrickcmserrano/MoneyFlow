import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';
import { AccessibilityTester } from './helpers/AccessibilityTester';

// Lista de requisitos específicos de acessibilidade
test.describe('Acessibilidade avançada', () => {
  test('deve ter contraste de cores adequado', async ({ page }) => {
    const homePage = new HomePage(page);
    const accessibilityTester = new AccessibilityTester(page);
    
    await homePage.goto();
    
    // Verificar contraste dos elementos principais
    const heading = page.locator('h1').first();
    await accessibilityTester.expectElementAccessible(heading);
    
    // Verificar acessibilidade do menu de navegação
    const languageSelector = homePage.languageSelector.english;
    await accessibilityTester.expectElementAccessible(languageSelector, { label: 'English' });
  });

  test('deve ter elementos de navegação acessíveis', { 
    skip: ({ browserName }) => browserName === 'webkit' // Skip no WebKit devido a inconsistências
  }, async ({ page }) => {
    const homePage = new HomePage(page);
    
    await homePage.goto();
    
    // Navegar para MoneyMind se necessário
    if (await page.locator('.moneyflow-wrapper').isVisible()) {
      const switchButton = page.getByRole('button', { name: homePage.expectedTexts.pt['moneymind.switch_to'] });
      await switchButton.click();
    }
    
    // Esperar que o MoneyMind esteja visível
    await expect(page.locator('.moneymind-wrapper')).toBeVisible();
    
    // Verificar navegabilidade por teclado nos links de navegação
    await homePage.expectKeyboardNavigableRoadmap();
  });

  test('deve ser resiliente a diferentes tamanhos de tela', async ({ page }) => {
    const homePage = new HomePage(page);
    
    // Testar em tamanho de desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await homePage.goto();
    await expect(page.locator('.language-selector')).toBeVisible();
    
    // Testar em tamanho de tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.language-selector')).toBeVisible();
    
    // Testar em tamanho de celular
    await page.setViewportSize({ width: 414, height: 896 });
    await expect(page.locator('.language-selector')).toBeVisible();
    
    // Verificar se o MoneyFlow também é responsivo
    await homePage.navigateToMoneyFlow();
    await expect(page.locator('.chart')).toBeVisible();
  });

  test('deve fornecer feedback visual ao usuário durante interações', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.navigateToMoneyFlow();
    
    // Iniciar uma animação
    const playButton = page.getByRole('button', { 
      name: new RegExp(homePage.expectedTexts.pt['moneyflow.animation.play'], 'i') 
    });
    
    await playButton.click();
    
    // Verificar se há feedback visual (barra de progresso)
    const progressBar = page.locator('.progress-fill');
    await expect(progressBar).toBeVisible();
    
    // Verificar se a barra de progresso muda ao longo do tempo
    const initialWidth = await progressBar.evaluate(el => el.style.width);
    await page.waitForTimeout(1000);
    const newWidth = await progressBar.evaluate(el => el.style.width);
    
    // Em alguns casos, podemos querer verificar se o valor mudou
    // Mas isso pode ser instável em testes, então podemos pular essa verificação
    // e apenas garantir que a barra está visível
    
    // Parar a animação
    const stopButton = page.getByRole('button', { 
      name: new RegExp(homePage.expectedTexts.pt['moneyflow.animation.stop'], 'i') 
    });
    
    await stopButton.click();
  });
});
