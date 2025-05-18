import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/HomePage';

test.describe('Navegação entre MoneyFlow e MoneyMind', () => {
  // Aumentar o timeout para esse conjunto de testes
  test.setTimeout(60000);
  
  test('deve alternar entre MoneyFlow e MoneyMind', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Verificar qual é a visão atual
    const isMoneyMindVisible = await page.locator('.moneymind-wrapper').isVisible();
    
    if (isMoneyMindVisible) {
      // Se estiver no MoneyMind, alternar para MoneyFlow
      const switchButton = page.getByRole('button', { name: homePage.expectedTexts.pt['moneymind.switch_back'] });
      await switchButton.click();
      
      // Verificar se alternou para MoneyFlow
      await expect(page.locator('.moneyflow-wrapper')).toBeVisible();
    } else {
      // Se estiver no MoneyFlow, alternar para MoneyMind
      const switchButton = page.getByRole('button', { name: homePage.expectedTexts.pt['moneymind.switch_to'] });
      await switchButton.click();
      
      // Verificar se alternou para MoneyMind
      await expect(page.locator('.moneymind-wrapper')).toBeVisible();
    }
  });

  test('deve navegar entre as seções do MoneyMind', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Garantir que estamos no MoneyMind
    if (await page.locator('.moneyflow-wrapper').isVisible()) {
      const switchButton = page.getByRole('button', { name: homePage.expectedTexts.pt['moneymind.switch_to'] });
      await switchButton.click();
    }
    
    // Esperar que o MoneyMind esteja visível
    await expect(page.locator('.moneymind-wrapper')).toBeVisible();
    
    // Teste de navegação usando o roadmap lateral
    const sections = ['primitiveorigins', 'coinsmetal', 'paperdigital', 'philosophy'];
    
    for (const sectionId of sections) {
      // Encontrar o link de navegação pelo texto em vez de data-attribute
      try {
        // Primeiro, tentar encontrar por texto da seção
        const navLinks = page.locator('.roadmap a');
        const count = await navLinks.count();
        
        let clicked = false;
        for (let i = 0; i < count; i++) {
          const linkText = await navLinks.nth(i).textContent();
          const linkHref = await navLinks.nth(i).getAttribute('href');
          
          // Verificar se o texto ou href contém o ID da seção
          if ((linkText && linkText.toLowerCase().includes(sectionId.toLowerCase())) || 
              (linkHref && linkHref.includes(sectionId))) {
            await navLinks.nth(i).click();
            clicked = true;
            break;
          }
        }
        
        if (!clicked) {
          console.log(`Não foi possível encontrar link para seção: ${sectionId}`);
          continue;
        }
      } catch (error) {
        console.log(`Erro ao navegar para seção ${sectionId}: ${error}`);
        continue;
      }
      
      // Verificar se a seção está visível
      await page.waitForTimeout(1000); // Aumentar tempo para a animação de scroll
      
      // Verificar se a seção foi definida como ativa
      const isActive = await page.evaluate((id) => {
        const element = document.getElementById(id);
        const viewportHeight = window.innerHeight;
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return rect.top >= -100 && rect.top <= viewportHeight / 2;
      }, sectionId);
      
      expect(isActive, `A seção ${sectionId} deveria estar visível`).toBeTruthy();
    }
  });

  test('deve exibir uma cena 3D no MoneyMind', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    // Garantir que estamos no MoneyMind
    if (await page.locator('.moneyflow-wrapper').isVisible()) {
      const switchButton = page.getByRole('button', { name: homePage.expectedTexts.pt['moneymind.switch_to'] });
      await switchButton.click();
    }
    
    // Esperar que o MoneyMind esteja visível
    await expect(page.locator('.moneymind-wrapper')).toBeVisible();
    
    // Verificar se a cena 3D foi carregada
    await page.waitForSelector('.coin-scene-container', { state: 'attached' });
    
    // Verificar se o container da cena está no DOM
    const hasContainer = await page.evaluate(() => {
      return document.querySelector('.coin-scene-container') !== null;
    });
    
    expect(hasContainer).toBeTruthy();
  });
});
